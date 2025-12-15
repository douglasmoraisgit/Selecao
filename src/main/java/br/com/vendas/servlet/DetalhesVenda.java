package br.com.vendas.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashSet;
import java.util.Set;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import br.com.vendas.dao.ConnectionFactory;
import br.com.vendas.util.GsonUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * DetalhesVenda.java
 * Servlet para carregar detalhes completos de uma venda
 * 
 * @author OptoFreela
 */
public class DetalhesVenda extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private Gson gson = GsonUtils.getGson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        JsonObject resultado = new JsonObject();
        
        try {
            String idStr = request.getParameter("id");
            
            if (idStr == null || idStr.isEmpty()) {
                resultado.addProperty("success", false);
                resultado.addProperty("message", "ID da venda não informado");
                out.print(gson.toJson(resultado));
                return;
            }
            
            long vendaId = Long.parseLong(idStr);
            
            System.out.println("📋 Carregando detalhes da venda #" + vendaId);
            
            Connection conn = ConnectionFactory.getInstance().getConnection();
            
            try {
                // Busca dados da venda
                JsonObject venda = buscarVenda(conn, vendaId);
                
                if (venda == null) {
                    resultado.addProperty("success", false);
                    resultado.addProperty("message", "Venda não encontrada");
                    out.print(gson.toJson(resultado));
                    return;
                }
                
                // Busca itens
                JsonArray itens = buscarItens(conn, vendaId);
                venda.add("itens", itens);
                
                // Busca pagamentos
                JsonArray pagamentos = buscarPagamentos(conn, vendaId);
                venda.add("pagamentos", pagamentos);
                
                resultado.add("venda", venda);
                resultado.addProperty("success", true);
                
                System.out.println("✅ Venda carregada: " + itens.size() + " itens, " + pagamentos.size() + " pagamentos");
                
            } finally {
                if (conn != null) conn.close();
            }
            
        } catch (Exception e) {
            System.err.println("❌ Erro ao carregar detalhes: " + e.getMessage());
            e.printStackTrace();
            
            resultado.addProperty("success", false);
            resultado.addProperty("message", "Erro: " + e.getMessage());
        }
        
        out.print(gson.toJson(resultado));
        out.flush();
    }

    /**
     * Busca dados da venda com JOIN para dados do cliente
     */
    private JsonObject buscarVenda(Connection conn, long vendaId) throws SQLException {
        String sql = "SELECT v.*, " +
                     "  COALESCE(c.nomeCliente, v.cliente) as cliente_nome, " +
                     "  COALESCE(c.cpfCliente, v.cpf) as cliente_cpf, " +
                     "  COALESCE(c.whatsCliente, c.telefoneCliente) as cliente_telefone, " +
                     "  c.emailCliente as cliente_email, " +
                     "  c.dataCadastro as cliente_desde " +
                     "FROM vendas v " +
                     "LEFT JOIN clientes c ON v.id_cliente = c.idCliente " +
                     "WHERE v.id = ?";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, vendaId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    JsonObject venda = new JsonObject();
                    
                    // Descobre quais colunas existem
                    Set<String> colunas = getColumnNames(rs);
                    
                    venda.addProperty("id", rs.getLong("id"));
                    venda.addProperty("id_pedido", rs.getLong("id_pedido"));
                    
                    if (colunas.contains("id_cliente"))
                        venda.addProperty("id_cliente", rs.getLong("id_cliente"));
                    
                    // Dados do cliente (do JOIN)
                    venda.addProperty("cliente", rs.getString("cliente_nome"));
                    venda.addProperty("cpf", rs.getString("cliente_cpf"));
                    venda.addProperty("telefone", rs.getString("cliente_telefone"));
                    venda.addProperty("email", rs.getString("cliente_email"));
                    venda.addProperty("cliente_desde", rs.getString("cliente_desde"));
                    
                    venda.addProperty("vendedor", rs.getString("vendedor"));
                    venda.addProperty("total", rs.getDouble("total"));
                    
                    if (colunas.contains("subtotal"))
                        venda.addProperty("subtotal", rs.getDouble("subtotal"));
                    if (colunas.contains("desconto"))
                        venda.addProperty("desconto", rs.getDouble("desconto"));
                    if (colunas.contains("desconto_tipo"))
                        venda.addProperty("desconto_tipo", rs.getString("desconto_tipo"));
                    if (colunas.contains("observacoes"))
                        venda.addProperty("observacoes", rs.getString("observacoes"));
                    
                    venda.addProperty("status", rs.getString("status"));
                    venda.addProperty("status_pagamento", rs.getString("status_pagamento"));
                    venda.addProperty("data", rs.getString("data"));
                    venda.addProperty("tipo_venda", rs.getString("tipo_venda"));
                    
                    if (colunas.contains("id_empresa_convenio"))
                        venda.addProperty("id_empresa_convenio", rs.getLong("id_empresa_convenio"));
                    if (colunas.contains("numero_autorizacao_convenio"))
                        venda.addProperty("numero_autorizacao_convenio", rs.getString("numero_autorizacao_convenio"));
                    
                    return venda;
                }
            }
        }
        
        return null;
    }

    /**
     * Busca itens da venda
     */
    private JsonArray buscarItens(Connection conn, long vendaId) throws SQLException {
        JsonArray itens = new JsonArray();
        
        String sql = "SELECT id, id_venda, id_produto, descricao, quantidade, " +
                     "preco_unitario, preco_tabela, desconto_percentual, desconto_valor, " +
                     "custo_unitario, subtotal, tratamentos, unidade, tipo " +
                     "FROM itens_venda WHERE id_venda = ? ORDER BY id";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, vendaId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    JsonObject item = new JsonObject();
                    
                    item.addProperty("id", rs.getLong("id"));
                    item.addProperty("id_produto", rs.getLong("id_produto"));
                    item.addProperty("descricao", rs.getString("descricao"));
                    item.addProperty("quantidade", rs.getDouble("quantidade"));
                    item.addProperty("preco_unitario", rs.getDouble("preco_unitario"));
                    item.addProperty("preco_tabela", rs.getDouble("preco_tabela"));
                    item.addProperty("desconto_percentual", rs.getDouble("desconto_percentual"));
                    item.addProperty("desconto_valor", rs.getDouble("desconto_valor"));
                    item.addProperty("custo_unitario", rs.getDouble("custo_unitario"));
                    item.addProperty("subtotal", rs.getDouble("subtotal"));
                    item.addProperty("tratamentos", rs.getString("tratamentos"));
                    item.addProperty("unidade", rs.getString("unidade"));
                    item.addProperty("tipo", rs.getString("tipo"));
                    
                    itens.add(item);
                }
            }
        }
        
        return itens;
    }

    /**
     * Busca pagamentos da venda
     */
    private JsonArray buscarPagamentos(Connection conn, long vendaId) throws SQLException {
        JsonArray pagamentos = new JsonArray();
        
        String sql = "SELECT * FROM venda_pagamentos WHERE id_venda = ? ORDER BY id";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, vendaId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                Set<String> colunas = getColumnNames(rs);
                
                while (rs.next()) {
                    JsonObject pag = new JsonObject();
                    
                    pag.addProperty("id", rs.getLong("id"));
                    
                    if (colunas.contains("forma_pagamento"))
                        pag.addProperty("forma_pagamento", rs.getString("forma_pagamento"));
                    if (colunas.contains("valor"))
                        pag.addProperty("valor", rs.getDouble("valor"));
                    if (colunas.contains("parcelas"))
                        pag.addProperty("parcelas", rs.getInt("parcelas"));
                    if (colunas.contains("bandeira"))
                        pag.addProperty("bandeira", rs.getString("bandeira"));
                    if (colunas.contains("status"))
                        pag.addProperty("status", rs.getString("status"));
                    if (colunas.contains("data_registro"))
                        pag.addProperty("data_registro", rs.getString("data_registro"));
                    if (colunas.contains("data_confirmacao"))
                        pag.addProperty("data_confirmacao", rs.getString("data_confirmacao"));
                    
                    pagamentos.add(pag);
                }
            }
        }
        
        return pagamentos;
    }

    /**
     * Helper: extrai nomes das colunas do ResultSet
     */
    private Set<String> getColumnNames(ResultSet rs) throws SQLException {
        Set<String> colunas = new HashSet<>();
        java.sql.ResultSetMetaData meta = rs.getMetaData();
        for (int i = 1; i <= meta.getColumnCount(); i++) {
            colunas.add(meta.getColumnName(i).toLowerCase());
        }
        return colunas;
    }
}
