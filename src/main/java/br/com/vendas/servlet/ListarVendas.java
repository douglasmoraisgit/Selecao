package br.com.vendas.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import br.com.vendas.dao.ConnectionFactory;
import br.com.vendas.util.GsonUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * ListarVendas.java
 * Servlet para listar vendas com filtros
 * 
 * ✅ ATUALIZADO: Agora filtra apenas vendas do usuário logado
 * 
 * ENDPOINT:
 * GET /ListarVendas?status=Pendente&periodo=mes
 * 
 * PARÂMETROS:
 * - status: Pendente, Pago, Cancelado, ou vazio para todos
 * - periodo: hoje, semana, mes, todos
 * 
 * FILTRO AUTOMÁTICO:
 * - Filtra por id_usuario da sessão (cada vendedor vê apenas suas vendas)
 * 
 * @author OptoFreela
 */
public class ListarVendas extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private Gson gson = GsonUtils.getGson();

    public ListarVendas() {
        super();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        JsonObject resultado = new JsonObject();
        
        try {
            // ✅ NOVO: Obtém dados do usuário da sessão
            HttpSession session = request.getSession(false);
            if (session == null) {
                throw new Exception("Sessão inválida. Faça login novamente.");
            }
            
            Integer usuarioId = (Integer) session.getAttribute("usuarioId");
            String usuarioNome = (String) session.getAttribute("usuarioNome");
            Integer lojaId = (Integer) session.getAttribute("lojaId");
            String perfilNome = (String) session.getAttribute("perfilNome");
            
            if (usuarioId == null) {
                throw new Exception("Usuário não autenticado. Faça login novamente.");
            }
            
            // Verifica se é admin (admin vê todas as vendas da loja)
            boolean isAdmin = "Admin".equalsIgnoreCase(perfilNome) || 
                              "Administrador".equalsIgnoreCase(perfilNome) ||
                              "Gerente".equalsIgnoreCase(perfilNome);
            
            String status = request.getParameter("status");
            String periodo = request.getParameter("periodo");
            
            System.out.println("╔════════════════════════════════════════════════════════════════╗");
            System.out.println("║  🧾 LISTANDO VENDAS                                            ║");
            System.out.println("╠════════════════════════════════════════════════════════════════╣");
            System.out.println("║  👤 Usuário: " + usuarioNome + " (ID: " + usuarioId + ")");
            System.out.println("║  🏪 Loja ID: " + lojaId);
            System.out.println("║  👑 Admin: " + isAdmin);
            System.out.println("╚════════════════════════════════════════════════════════════════╝");
            System.out.println("Status: " + (status != null && !status.isEmpty() ? status : "todos"));
            System.out.println("Período: " + (periodo != null ? periodo : "mes"));
            
            Connection conn = ConnectionFactory.getInstance().getConnection();
            
            try {
                JsonArray vendas = buscarVendas(conn, status, periodo, usuarioId, lojaId, isAdmin);
                
                resultado.add("vendas", vendas);
                resultado.addProperty("total", vendas.size());
                resultado.addProperty("success", true);
                
                System.out.println("✅ " + vendas.size() + " vendas encontradas");
                
            } finally {
                if (conn != null) conn.close();
            }
            
        } catch (Exception e) {
            System.err.println("❌ Erro ao listar vendas: " + e.getMessage());
            e.printStackTrace();
            
            resultado.addProperty("success", false);
            resultado.addProperty("message", "Erro ao listar vendas: " + e.getMessage());
        }
        
        out.print(gson.toJson(resultado));
        out.flush();
    }

    /**
     * Busca vendas com filtros
     * ✅ ATUALIZADO: Filtra por usuário ou loja
     */
    private JsonArray buscarVendas(Connection conn, String status, String periodo, 
                                   Integer usuarioId, Integer lojaId, boolean isAdmin) throws SQLException {
        JsonArray vendas = new JsonArray();
        
        StringBuilder sql = new StringBuilder();
        List<Object> params = new ArrayList<>();
        
        sql.append("SELECT v.*, ");
        sql.append("  (SELECT COUNT(*) FROM itens_venda WHERE id_venda = v.id) as qtd_itens, ");
        sql.append("  COALESCE((SELECT SUM(valor) FROM venda_pagamentos WHERE id_venda = v.id AND status = 'CONFIRMADO'), 0) as total_pago, ");
        sql.append("  COALESCE(c.nomeCliente, v.cliente) as cliente_nome, ");
        sql.append("  COALESCE(c.cpfCliente, v.cpf) as cliente_cpf, ");
        sql.append("  COALESCE(c.whatsCliente, c.telefoneCliente) as cliente_telefone, ");
        sql.append("  c.emailCliente as cliente_email ");
        sql.append("FROM vendas v ");
        sql.append("LEFT JOIN clientes c ON v.id_cliente = c.idCliente ");
        sql.append("WHERE 1=1 ");
        
        // ✅ NOVO: Filtro por usuário ou loja
        if (isAdmin) {
            // Admin vê todas as vendas da loja
            if (lojaId != null) {
                sql.append("AND v.id_loja = ? ");
                params.add(lojaId);
            }
        } else {
            // Vendedor comum vê apenas suas próprias vendas
            sql.append("AND v.id_usuario = ? ");
            params.add(usuarioId);
        }
        
        // Filtro de status
        if (status != null && !status.isEmpty()) {
            if ("Pendente".equals(status)) {
                sql.append("AND v.status != 'Cancelado' AND v.status_pagamento = 'Pendente' ");
            } else if ("Pago".equals(status)) {
                sql.append("AND v.status_pagamento = 'Pago' ");
            } else if ("Cancelado".equals(status)) {
                sql.append("AND v.status = 'Cancelado' ");
            }
        }
        
        // Filtro de período
        if (periodo == null || periodo.isEmpty()) {
            periodo = "mes";
        }
        
        if (!"todos".equals(periodo)) {
            Calendar cal = Calendar.getInstance();
            
            if ("hoje".equals(periodo)) {
                sql.append("AND DATE(v.data) = CURDATE() ");
            } else if ("semana".equals(periodo)) {
                cal.set(Calendar.DAY_OF_WEEK, cal.getFirstDayOfWeek());
                sql.append("AND v.data >= ? ");
                params.add(formatDate(cal));
            } else if ("mes".equals(periodo)) {
                cal.set(Calendar.DAY_OF_MONTH, 1);
                sql.append("AND v.data >= ? ");
                params.add(formatDate(cal));
            }
        }
        
        sql.append("ORDER BY v.data DESC ");
        sql.append("LIMIT 200");
        
        try (PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            // Seta parâmetros
            int idx = 1;
            for (Object param : params) {
                if (param instanceof Integer) {
                    stmt.setInt(idx++, (Integer) param);
                } else if (param instanceof String) {
                    stmt.setString(idx++, (String) param);
                }
            }
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    JsonObject venda = new JsonObject();
                    venda.addProperty("id", rs.getLong("id"));
                    venda.addProperty("id_pedido", rs.getLong("id_pedido"));
                    venda.addProperty("id_cliente", rs.getLong("id_cliente"));
                    venda.addProperty("cliente", rs.getString("cliente_nome"));
                    venda.addProperty("cpf", rs.getString("cliente_cpf"));
                    venda.addProperty("telefone", rs.getString("cliente_telefone"));
                    venda.addProperty("email", rs.getString("cliente_email"));
                    venda.addProperty("vendedor", rs.getString("vendedor"));
                    venda.addProperty("subtotal", rs.getDouble("subtotal"));
                    venda.addProperty("desconto", rs.getDouble("desconto"));
                    venda.addProperty("total", rs.getDouble("total"));
                    venda.addProperty("status", rs.getString("status"));
                    venda.addProperty("status_pagamento", rs.getString("status_pagamento"));
                    venda.addProperty("data", rs.getString("data"));
                    venda.addProperty("qtd_itens", rs.getInt("qtd_itens"));
                    venda.addProperty("total_pago", rs.getDouble("total_pago"));
                    venda.addProperty("tipo_venda", rs.getString("tipo_venda"));
                    
                    vendas.add(venda);
                }
            }
        }
        
        return vendas;
    }

    /**
     * Formata data para SQL
     */
    private String formatDate(Calendar cal) {
        return String.format("%04d-%02d-%02d",
            cal.get(Calendar.YEAR),
            cal.get(Calendar.MONTH) + 1,
            cal.get(Calendar.DAY_OF_MONTH)
        );
    }
}
