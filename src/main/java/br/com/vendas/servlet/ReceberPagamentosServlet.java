package br.com.vendas.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import br.com.vendas.dao.ConnectionFactory;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * ReceberPagamentosServlet.java
 * Busca os pagamentos de uma venda específica
 * 
 * ENDPOINT:
 * GET /ReceberPagamentosServlet?idVenda=123
 * 
 * RESPOSTA:
 * {
 *   "success": true,
 *   "idVenda": 123,
 *   "pagamentos": [
 *     {
 *       "id": 1,
 *       "tipoPagamento": "CREDITO",
 *       "valor": 150.00,
 *       "bandeira": "VISA",
 *       "parcelas": 3,
 *       "statusPagamento": "pendente",
 *       "numeroAutorizacao": null
 *     }
 *   ],
 *   "totalVenda": 300.00,
 *   "totalPago": 150.00,
 *   "totalPendente": 150.00
 * }
 * 
 * @author OptoFreela
 */
public class ReceberPagamentosServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        String idVendaParam = request.getParameter("idVenda");
        
        System.out.println("");
        System.out.println("┌─────────────────────────────────────────────────────────────────");
        System.out.println("│ 💳 ReceberPagamentosServlet");
        System.out.println("│ idVenda: " + idVendaParam);
        System.out.println("└─────────────────────────────────────────────────────────────────");
        
        JsonObject resultado = new JsonObject();
        
        // Validação
        if (idVendaParam == null || idVendaParam.trim().isEmpty()) {
            resultado.addProperty("success", false);
            resultado.addProperty("error", "Parâmetro idVenda é obrigatório");
            enviarResposta(response, resultado, HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        
        long idVenda;
        try {
            idVenda = Long.parseLong(idVendaParam.trim());
        } catch (NumberFormatException e) {
            resultado.addProperty("success", false);
            resultado.addProperty("error", "idVenda deve ser um número válido");
            enviarResposta(response, resultado, HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        
        Connection conn = null;
        
        try {
            conn = ConnectionFactory.getInstance().getConnection();
            
            // Busca pagamentos da venda
            JsonArray pagamentos = buscarPagamentos(conn, idVenda);
            
            // Calcula totais
            double totalVenda = 0;
            double totalPago = 0;
            double totalPendente = 0;
            
            for (int i = 0; i < pagamentos.size(); i++) {
                JsonObject pag = pagamentos.get(i).getAsJsonObject();
                double valor = pag.get("valor").getAsDouble();
                String status = pag.get("statusPagamento").getAsString();
                
                totalVenda += valor;
                
                if ("pago".equalsIgnoreCase(status) || "aprovado".equalsIgnoreCase(status)) {
                    totalPago += valor;
                } else {
                    totalPendente += valor;
                }
            }
            
            resultado.addProperty("success", true);
            resultado.addProperty("idVenda", idVenda);
            resultado.add("pagamentos", pagamentos);
            resultado.addProperty("totalVenda", totalVenda);
            resultado.addProperty("totalPago", totalPago);
            resultado.addProperty("totalPendente", totalPendente);
            resultado.addProperty("quantidadePagamentos", pagamentos.size());
            
            System.out.println("│ ✅ " + pagamentos.size() + " pagamentos encontrados");
            System.out.println("│ Total: R$ " + String.format("%.2f", totalVenda));
            
            enviarResposta(response, resultado, HttpServletResponse.SC_OK);
            
        } catch (Exception e) {
            System.err.println("│ ❌ Erro: " + e.getMessage());
            e.printStackTrace();
            
            resultado.addProperty("success", false);
            resultado.addProperty("error", "Erro ao buscar pagamentos: " + e.getMessage());
            enviarResposta(response, resultado, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            
        } finally {
            if (conn != null) {
                try {
                    conn.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
    }
    
    /**
     * Busca pagamentos de uma venda
     * 
     * NOTA: O frontend envia vendas.id (auto-increment), mas
     * venda_pagamentos.id_venda referencia vendas.id_pedido
     */
    private JsonArray buscarPagamentos(Connection conn, long idVenda) throws SQLException {
        JsonArray pagamentos = new JsonArray();
        
        // venda_pagamentos.id_venda = vendas.id (auto-increment)
        // O parâmetro idVenda que chega é vendas.id
        String sql = """
            SELECT 
                vp.id,
                vp.id_venda,
                vp.forma_pagamento,
                vp.valor,
                vp.parcelas,
                vp.valor_parcela,
                vp.bandeira,
                vp.nsu,
                vp.autorizacao_cartao,
                vp.id_empresa_convenio,
                vp.numero_autorizacao,
                COALESCE(vp.status, 'PENDENTE') as status,
                vp.data_confirmacao,
                vp.usuario_confirmacao,
                vp.observacoes
            FROM venda_pagamentos vp
            WHERE vp.id_venda = ?
            ORDER BY vp.id
        """;
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, idVenda);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    JsonObject pag = new JsonObject();
                    
                    pag.addProperty("id", rs.getLong("id"));
                    pag.addProperty("idVenda", rs.getLong("id_venda"));
                    pag.addProperty("tipoPagamento", rs.getString("forma_pagamento"));
                    pag.addProperty("formaPagamento", rs.getString("forma_pagamento"));
                    
                    String bandeira = rs.getString("bandeira");
                    pag.addProperty("bandeira", bandeira != null ? bandeira : "");
                    
                    pag.addProperty("valor", rs.getDouble("valor"));
                    
                    int parcelas = rs.getInt("parcelas");
                    pag.addProperty("parcelas", parcelas > 0 ? parcelas : 1);
                    
                    double valorParcela = rs.getDouble("valor_parcela");
                    pag.addProperty("valorParcela", valorParcela);
                    
                    // NSU e autorização de cartão
                    String nsu = rs.getString("nsu");
                    pag.addProperty("nsu", nsu != null ? nsu : "");
                    
                    String autCartao = rs.getString("autorizacao_cartao");
                    pag.addProperty("autorizacaoCartao", autCartao != null ? autCartao : "");
                    
                    // Convênio
                    long idEmpConv = rs.getLong("id_empresa_convenio");
                    if (!rs.wasNull()) {
                        pag.addProperty("idEmpresaConvenio", idEmpConv);
                    }
                    
                    String numAut = rs.getString("numero_autorizacao");
                    pag.addProperty("numeroAutorizacao", numAut != null ? numAut : "");
                    
                    // Status - mapear para formato do frontend
                    String status = rs.getString("status");
                    if (status == null || status.trim().isEmpty()) {
                        status = "PENDENTE";
                    }
                    // Converte CONFIRMADO -> aprovado para compatibilidade
                    String statusFrontend = "CONFIRMADO".equals(status) ? "aprovado" : 
                                           "CANCELADO".equals(status) ? "cancelado" : "pendente";
                    pag.addProperty("statusPagamento", statusFrontend);
                    pag.addProperty("statusOriginal", status);
                    
                    // Data de confirmação
                    if (rs.getTimestamp("data_confirmacao") != null) {
                        pag.addProperty("dataAprovacao", rs.getTimestamp("data_confirmacao").toString());
                    } else {
                        pag.addProperty("dataAprovacao", "");
                    }
                    
                    String usuarioConf = rs.getString("usuario_confirmacao");
                    pag.addProperty("usuarioAprovacao", usuarioConf != null ? usuarioConf : "");
                    
                    String obs = rs.getString("observacoes");
                    pag.addProperty("observacao", obs != null ? obs : "");
                    
                    pagamentos.add(pag);
                }
            }
        }
        
        return pagamentos;
    }
    
    /**
     * Envia resposta JSON
     */
    private void enviarResposta(HttpServletResponse response, JsonObject json, int status) 
            throws IOException {
        response.setStatus(status);
        PrintWriter out = response.getWriter();
        out.print(gson.toJson(json));
        out.flush();
    }
}
