package br.com.vendas.servlet;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import br.com.vendas.dao.ConnectionFactory;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * ConfirmarPagamentoServlet.java
 * Confirma recebimento de um pagamento individual
 * 
 * ENDPOINT:
 * POST /ConfirmarPagamentoServlet
 * 
 * BODY (JSON):
 * {
 *   "idPagamento": 123,
 *   "numeroAutorizacao": "ABC123" // opcional, para convênio
 * }
 * 
 * FLUXO:
 * 1. Atualiza status do pagamento para CONFIRMADO
 * 2. Verifica se TODOS os pagamentos da venda foram confirmados
 * 3. Se sim, atualiza vendas.status_pagamento para 'Pago'
 * 
 * @author OptoFreela
 */
public class ConfirmarPagamentoServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private final Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        JsonObject resultado = new JsonObject();
        
        // Verificar sessão
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("usuario") == null) {
            resultado.addProperty("success", false);
            resultado.addProperty("error", "Usuário não autenticado");
            enviarResposta(response, resultado, HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        
        String usuarioNome = (String) session.getAttribute("usuarioNome");
        
        Connection conn = null;
        
        try {
            // Ler body JSON
            StringBuilder sb = new StringBuilder();
            BufferedReader reader = request.getReader();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            
            JsonParser parser = new JsonParser();
            JsonObject dados = parser.parse(sb.toString()).getAsJsonObject();
            
            long idPagamento = dados.get("idPagamento").getAsLong();
            String numeroAutorizacao = dados.has("numeroAutorizacao") && !dados.get("numeroAutorizacao").isJsonNull()
                ? dados.get("numeroAutorizacao").getAsString() : null;
            
            System.out.println("");
            System.out.println("┌─────────────────────────────────────────────────────────────────");
            System.out.println("│ ✅ ConfirmarPagamentoServlet");
            System.out.println("│ ID Pagamento: " + idPagamento);
            System.out.println("│ Usuário: " + usuarioNome);
            if (numeroAutorizacao != null) {
                System.out.println("│ Autorização: " + numeroAutorizacao);
            }
            System.out.println("└─────────────────────────────────────────────────────────────────");
            
            conn = ConnectionFactory.getInstance().getConnection();
            conn.setAutoCommit(false);
            
            try {
                // 1. Buscar id_venda do pagamento
                long idVenda = buscarIdVendaDoPagamento(conn, idPagamento);
                
                if (idVenda == 0) {
                    throw new Exception("Pagamento não encontrado");
                }
                
                // 2. Atualizar status do pagamento para CONFIRMADO
                atualizarStatusPagamento(conn, idPagamento, usuarioNome, numeroAutorizacao);
                
                // 3. Verificar se TODOS os pagamentos da venda foram confirmados
                boolean todosConfirmados = verificarTodosPagamentosConfirmados(conn, idVenda);
                
                // 4. Se todos confirmados, atualizar status da venda
                if (todosConfirmados) {
                    atualizarStatusVenda(conn, idVenda);
                    System.out.println("│ 🎉 Todos pagamentos confirmados! Venda finalizada.");
                }
                
                conn.commit();
                
                resultado.addProperty("success", true);
                resultado.addProperty("idPagamento", idPagamento);
                resultado.addProperty("todosConfirmados", todosConfirmados);
                resultado.addProperty("message", todosConfirmados 
                    ? "Pagamento confirmado! Venda finalizada." 
                    : "Pagamento confirmado!");
                
                System.out.println("│ ✅ Pagamento " + idPagamento + " confirmado");
                
            } catch (Exception e) {
                conn.rollback();
                throw e;
            }
            
            enviarResposta(response, resultado, HttpServletResponse.SC_OK);
            
        } catch (Exception e) {
            System.err.println("│ ❌ Erro: " + e.getMessage());
            e.printStackTrace();
            
            resultado.addProperty("success", false);
            resultado.addProperty("error", "Erro ao confirmar pagamento: " + e.getMessage());
            enviarResposta(response, resultado, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
    }
    
    /**
     * Busca o id_venda (id_pedido) do pagamento
     */
    private long buscarIdVendaDoPagamento(Connection conn, long idPagamento) throws SQLException {
        String sql = "SELECT id_venda FROM venda_pagamentos WHERE id = ?";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, idPagamento);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getLong("id_venda");
                }
            }
        }
        
        return 0;
    }
    
    /**
     * Atualiza status do pagamento para CONFIRMADO
     */
    private void atualizarStatusPagamento(Connection conn, long idPagamento, 
            String usuario, String numeroAutorizacao) throws SQLException {
        
        String sql = """
            UPDATE venda_pagamentos 
            SET status = 'CONFIRMADO',
                data_confirmacao = NOW(),
                usuario_confirmacao = ?,
                numero_autorizacao = COALESCE(?, numero_autorizacao)
            WHERE id = ?
        """;
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, usuario);
            stmt.setString(2, numeroAutorizacao);
            stmt.setLong(3, idPagamento);
            
            stmt.executeUpdate();
        }
    }
    
    /**
     * Verifica se TODOS os pagamentos da venda foram confirmados
     */
    private boolean verificarTodosPagamentosConfirmados(Connection conn, long idVenda) throws SQLException {
        String sql = """
            SELECT COUNT(*) as total,
                   SUM(CASE WHEN status = 'CONFIRMADO' THEN 1 ELSE 0 END) as confirmados
            FROM venda_pagamentos 
            WHERE id_venda = ?
        """;
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, idVenda);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    int total = rs.getInt("total");
                    int confirmados = rs.getInt("confirmados");
                    
                    System.out.println("│ Pagamentos: " + confirmados + "/" + total + " confirmados");
                    
                    return total > 0 && total == confirmados;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Atualiza status da venda para 'Pago'
     */
    private void atualizarStatusVenda(Connection conn, long idVenda) throws SQLException {
        String sql = """
            UPDATE vendas 
            SET status_pagamento = 'Pago'
            WHERE id = ?
        """;
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, idVenda);
            stmt.executeUpdate();
        }
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
