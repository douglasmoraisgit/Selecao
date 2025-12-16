package br.com.vendas.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import br.com.vendas.beans.Usuario;
import br.com.vendas.dao.ConnectionFactory;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * CaixaRecebimentoServlet
 * 
 * Servlet para o módulo de Caixa - Recebimentos
 * 
 * Endpoints:
 * GET ?action=listarPendentes&data=YYYY-MM-DD&idLoja=X
 *     → Lista vendas pendentes de recebimento
 * 
 * GET ?action=totalizadores&data=YYYY-MM-DD&idLoja=X
 *     → Retorna totalizadores do dia
 * 
 * GET ?action=health
 *     → Health check
 */
public class CaixaRecebimentoServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        String action = request.getParameter("action");
        
        if (action == null) {
            action = "listarPendentes";
        }
        
        try {
            switch (action) {
                case "listarPendentes":
                    listarVendasPendentes(request, response);
                    break;
                case "totalizadores":
                    buscarTotalizadores(request, response);
                    break;
                case "health":
                    healthCheck(response);
                    break;
                default:
                    enviarErro(response, 400, "Ação desconhecida: " + action);
            }
        } catch (Exception e) {
            e.printStackTrace();
            enviarErro(response, 500, "Erro interno: " + e.getMessage());
        }
    }
    
    /**
     * Lista vendas pendentes de recebimento
     */
    private void listarVendasPendentes(HttpServletRequest request, HttpServletResponse response)
            throws IOException, SQLException {
        
        String dataParam = request.getParameter("data");
        String idLojaParam = request.getParameter("idLoja");
        
        // Validar parâmetros
        LocalDate data = (dataParam != null && !dataParam.isEmpty())
                ? LocalDate.parse(dataParam)
                : LocalDate.now();
        
        int idLoja = 1;
        if (idLojaParam != null && !idLojaParam.isEmpty()) {
            idLoja = Integer.parseInt(idLojaParam);
        } else {
            // Tentar obter da sessão
            Usuario usuario = (Usuario) request.getSession().getAttribute("usuario");
            if (usuario != null && usuario.getOtica() != null) {
                idLoja = usuario.getOtica().getIdOtica();
            }
        }
        
        JsonArray vendas = new JsonArray();
        
        String sql = """
            SELECT 
                v.id,
                v.id_pedido,
                v.id_loja,
                v.data,
                v.cliente,
                v.id_cliente,
                v.vendedor,
                v.total,
                v.status_pagamento,
                TIME_FORMAT(v.data, '%H:%i') as hora_formatada,
                (SELECT COUNT(*) FROM forma_pagamento_venda fp WHERE fp.id_venda = v.id_pedido) as qtd_pagamentos,
                (SELECT SUM(fp.valor) FROM forma_pagamento_venda fp 
                 WHERE fp.id_venda = v.id_pedido AND fp.status_pagamento = 'aprovado') as valor_aprovado
            FROM vendas v
            WHERE DATE(v.data) = ?
              AND v.id_loja = ?
              AND (v.status_pagamento IS NULL 
                   OR v.status_pagamento = '' 
                   OR v.status_pagamento = 'pendente'
                   OR v.status_pagamento = 'Pendente')
            ORDER BY v.data DESC
        """;
        
        try (Connection conn = ConnectionFactory.getInstance().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setDate(1, java.sql.Date.valueOf(data));
            ps.setInt(2, idLoja);
            
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    JsonObject venda = new JsonObject();
                    
                    venda.addProperty("idVenda", rs.getLong("id"));
                    venda.addProperty("idPedido", rs.getInt("id_pedido"));
                    venda.addProperty("idLoja", rs.getInt("id_loja"));
                    venda.addProperty("cliente", rs.getString("cliente"));
                    venda.addProperty("idCliente", rs.getInt("id_cliente"));
                    venda.addProperty("vendedor", rs.getString("vendedor"));
                    venda.addProperty("valorTotal", rs.getDouble("total"));
                    venda.addProperty("statusPagamento", 
                        rs.getString("status_pagamento") != null ? rs.getString("status_pagamento") : "pendente");
                    venda.addProperty("horaFormatada", rs.getString("hora_formatada"));
                    venda.addProperty("qtdPagamentos", rs.getInt("qtd_pagamentos"));
                    venda.addProperty("valorAprovado", rs.getDouble("valor_aprovado"));
                    
                    // Data formatada
                    if (rs.getTimestamp("data") != null) {
                        venda.addProperty("data", rs.getTimestamp("data").toString());
                    }
                    
                    vendas.add(venda);
                }
            }
        }
        
        // Montar resposta
        JsonObject resultado = new JsonObject();
        resultado.addProperty("success", true);
        resultado.addProperty("data", data.toString());
        resultado.addProperty("idLoja", idLoja);
        resultado.addProperty("total", vendas.size());
        resultado.add("vendas", vendas);
        
        PrintWriter out = response.getWriter();
        out.print(gson.toJson(resultado));
        out.flush();
    }
    
    /**
     * Retorna totalizadores do dia
     */
    private void buscarTotalizadores(HttpServletRequest request, HttpServletResponse response)
            throws IOException, SQLException {
        
        String dataParam = request.getParameter("data");
        String idLojaParam = request.getParameter("idLoja");
        
        LocalDate data = (dataParam != null && !dataParam.isEmpty())
                ? LocalDate.parse(dataParam)
                : LocalDate.now();
        
        int idLoja = (idLojaParam != null && !idLojaParam.isEmpty())
                ? Integer.parseInt(idLojaParam)
                : 1;
        
        JsonObject totais = new JsonObject();
        
        String sql = """
            SELECT 
                COUNT(DISTINCT v.id) as qtd_vendas,
                COALESCE(SUM(v.total), 0) as total_vendas,
                
                COALESCE(SUM(CASE WHEN v.status_pagamento IN ('pendente', 'Pendente', '', NULL) 
                    THEN v.total ELSE 0 END), 0) as total_pendente,
                    
                COALESCE(SUM(CASE WHEN v.status_pagamento IN ('pago', 'aprovado') 
                    THEN v.total ELSE 0 END), 0) as total_recebido,
                
                COUNT(CASE WHEN v.status_pagamento IN ('pendente', 'Pendente', '', NULL) 
                    THEN 1 END) as qtd_pendentes,
                    
                COUNT(CASE WHEN v.status_pagamento IN ('pago', 'aprovado') 
                    THEN 1 END) as qtd_recebidas
                    
            FROM vendas v
            WHERE DATE(v.data) = ?
              AND v.id_loja = ?
        """;
        
        // Totais por forma de pagamento
        String sqlFormas = """
            SELECT 
                LOWER(fp.tipo_pagamento) as tipo,
                COALESCE(SUM(CASE WHEN fp.status_pagamento = 'aprovado' THEN fp.valor ELSE 0 END), 0) as valor
            FROM forma_pagamento_venda fp
            INNER JOIN vendas v ON v.id_pedido = fp.id_venda
            WHERE DATE(v.data) = ?
              AND v.id_loja = ?
            GROUP BY LOWER(fp.tipo_pagamento)
        """;
        
        try (Connection conn = ConnectionFactory.getInstance().getConnection()) {
            
            // Totais gerais
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setDate(1, java.sql.Date.valueOf(data));
                ps.setInt(2, idLoja);
                
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        totais.addProperty("quantidadeVendas", rs.getInt("qtd_vendas"));
                        totais.addProperty("totalVendas", rs.getDouble("total_vendas"));
                        totais.addProperty("valorPendente", rs.getDouble("total_pendente"));
                        totais.addProperty("valorRecebido", rs.getDouble("total_recebido"));
                        totais.addProperty("quantidadePendentes", rs.getInt("qtd_pendentes"));
                        totais.addProperty("quantidadeRecebidas", rs.getInt("qtd_recebidas"));
                    }
                }
            }
            
            // Totais por forma de pagamento
            JsonObject porFormaPagamento = new JsonObject();
            porFormaPagamento.addProperty("dinheiro", 0.0);
            porFormaPagamento.addProperty("pix", 0.0);
            porFormaPagamento.addProperty("debito", 0.0);
            porFormaPagamento.addProperty("credito", 0.0);
            porFormaPagamento.addProperty("convenio", 0.0);
            
            try (PreparedStatement ps = conn.prepareStatement(sqlFormas)) {
                ps.setDate(1, java.sql.Date.valueOf(data));
                ps.setInt(2, idLoja);
                
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        String tipo = rs.getString("tipo");
                        double valor = rs.getDouble("valor");
                        
                        if (tipo == null) continue;
                        
                        if (tipo.contains("dinheiro")) {
                            porFormaPagamento.addProperty("dinheiro", valor);
                        } else if (tipo.contains("pix")) {
                            porFormaPagamento.addProperty("pix", valor);
                        } else if (tipo.contains("débito") || tipo.contains("debito")) {
                            porFormaPagamento.addProperty("debito", valor);
                        } else if (tipo.contains("crédito") || tipo.contains("credito")) {
                            porFormaPagamento.addProperty("credito", valor);
                        } else if (tipo.contains("convênio") || tipo.contains("convenio")) {
                            porFormaPagamento.addProperty("convenio", valor);
                        }
                    }
                }
            }
            
            totais.add("porFormaPagamento", porFormaPagamento);
        }
        
        // Resposta
        JsonObject resultado = new JsonObject();
        resultado.addProperty("success", true);
        resultado.addProperty("data", data.toString());
        resultado.add("totais", totais);
        
        PrintWriter out = response.getWriter();
        out.print(gson.toJson(resultado));
        out.flush();
    }
    
    /**
     * Health check
     */
    private void healthCheck(HttpServletResponse response) throws IOException {
        JsonObject resultado = new JsonObject();
        resultado.addProperty("status", "ok");
        resultado.addProperty("timestamp", System.currentTimeMillis());
        resultado.addProperty("service", "CaixaRecebimentoServlet");
        
        PrintWriter out = response.getWriter();
        out.print(gson.toJson(resultado));
        out.flush();
    }
    
    /**
     * Envia resposta de erro
     */
    private void enviarErro(HttpServletResponse response, int status, String mensagem) throws IOException {
        response.setStatus(status);
        
        JsonObject erro = new JsonObject();
        erro.addProperty("success", false);
        erro.addProperty("error", mensagem);
        erro.addProperty("status", status);
        
        PrintWriter out = response.getWriter();
        out.print(gson.toJson(erro));
        out.flush();
    }
}
