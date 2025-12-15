package br.com.vendas.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
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
 * ListarOrcamentos.java
 * Servlet para listar e buscar orçamentos salvos
 * 
 * ✅ ATUALIZADO: Agora filtra apenas orçamentos do usuário logado
 * 
 * ENDPOINTS:
 * GET /ListarOrcamentos              → Lista orçamentos do usuário
 * GET /ListarOrcamentos?cliente=nome → Busca por nome do cliente
 * GET /ListarOrcamentos?id=123       → Busca orçamento específico
 * GET /ListarOrcamentos?status=PENDENTE → Filtra por status
 * 
 * FILTRO AUTOMÁTICO:
 * - Filtra por id_usuario da sessão (cada vendedor vê apenas seus orçamentos)
 * 
 * @author OptoFreela
 */
public class ListarOrcamentos extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private Gson gson = GsonUtils.getGson();

    public ListarOrcamentos() {
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
            
            // Verifica se é admin (admin vê todos os orçamentos da loja)
            boolean isAdmin = "Admin".equalsIgnoreCase(perfilNome) || 
                              "Administrador".equalsIgnoreCase(perfilNome) ||
                              "Gerente".equalsIgnoreCase(perfilNome);
            
            // Parâmetros de filtro
            String clienteBusca = request.getParameter("cliente");
            String idBusca = request.getParameter("id");
            String statusBusca = request.getParameter("status");
            String limitStr = request.getParameter("limit");
            
            int limit = 50;
            if (limitStr != null && !limitStr.isEmpty()) {
                try {
                    limit = Integer.parseInt(limitStr);
                } catch (NumberFormatException e) {
                    limit = 50;
                }
            }
            
            System.out.println("╔════════════════════════════════════════════════════════════════╗");
            System.out.println("║  📋 LISTANDO ORÇAMENTOS                                        ║");
            System.out.println("╠════════════════════════════════════════════════════════════════╣");
            System.out.println("║  👤 Usuário: " + usuarioNome + " (ID: " + usuarioId + ")");
            System.out.println("║  🏪 Loja ID: " + lojaId);
            System.out.println("║  👑 Admin: " + isAdmin);
            System.out.println("╚════════════════════════════════════════════════════════════════╝");
            
            // Busca orçamentos
            List<JsonObject> orcamentos = buscarOrcamentos(clienteBusca, idBusca, statusBusca, limit,
                                                           usuarioId, lojaId, isAdmin);
            
            System.out.println("Total encontrado: " + orcamentos.size());
            
            // Monta resposta
            JsonArray orcamentosArray = new JsonArray();
            for (JsonObject orc : orcamentos) {
                orcamentosArray.add(orc);
            }
            
            resultado.addProperty("success", true);
            resultado.add("orcamentos", orcamentosArray);
            resultado.addProperty("total", orcamentos.size());
            
        } catch (Exception e) {
            System.err.println("❌ Erro ao listar orçamentos: " + e.getMessage());
            e.printStackTrace();
            
            resultado.addProperty("success", false);
            resultado.addProperty("message", "Erro ao listar orçamentos: " + e.getMessage());
        }
        
        out.print(gson.toJson(resultado));
        out.flush();
    }

    /**
     * Busca orçamentos no banco de dados
     * ✅ ATUALIZADO: Filtra por usuário ou loja
     */
    private List<JsonObject> buscarOrcamentos(String cliente, String id, String status, int limit,
                                               Integer usuarioId, Integer lojaId, boolean isAdmin) 
            throws SQLException {
        
        List<JsonObject> orcamentos = new ArrayList<>();
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        
        try {
            conn = ConnectionFactory.getInstance().getConnection();
            
            // Monta query dinâmica
            StringBuilder sql = new StringBuilder();
            sql.append("SELECT o.*, ");
            sql.append("       (SELECT COUNT(*) FROM orcamento_itens WHERE orcamento_id = o.id AND tipo = 'lente') as qtd_lentes, ");
            sql.append("       (SELECT COUNT(*) FROM orcamento_itens WHERE orcamento_id = o.id AND tipo = 'produto') as qtd_produtos ");
            sql.append("FROM orcamentos o ");
            sql.append("WHERE 1=1 ");
            
            List<Object> params = new ArrayList<>();
            
            // ✅ NOVO: Filtro por usuário ou loja
            // Usa vendedor_id (campo existente na tabela)
            if (isAdmin) {
                // Admin vê todos os orçamentos da loja
                if (lojaId != null) {
                    sql.append("AND o.id_loja = ? ");
                    params.add(lojaId);
                }
            } else {
                // Vendedor comum vê apenas seus próprios orçamentos
                sql.append("AND o.vendedor_id = ? ");
                params.add(usuarioId);
            }
            
            if (id != null && !id.isEmpty()) {
                sql.append("AND o.id = ? ");
                params.add(Long.parseLong(id));
            }
            
            if (cliente != null && !cliente.isEmpty()) {
                sql.append("AND UPPER(o.cliente_nome) LIKE UPPER(?) ");
                params.add("%" + cliente + "%");
            }
            
            if (status != null && !status.isEmpty()) {
                sql.append("AND o.status = ? ");
                params.add(status);
            }
            
            sql.append("ORDER BY o.data_hora DESC ");
            sql.append("LIMIT ?");
            params.add(limit);
            
            stmt = conn.prepareStatement(sql.toString());
            
            // Seta parâmetros
            for (int i = 0; i < params.size(); i++) {
                Object param = params.get(i);
                if (param instanceof Long) {
                    stmt.setLong(i + 1, (Long) param);
                } else if (param instanceof Integer) {
                    stmt.setInt(i + 1, (Integer) param);
                } else {
                    stmt.setString(i + 1, param.toString());
                }
            }
            
            rs = stmt.executeQuery();
            
            while (rs.next()) {
                JsonObject orc = new JsonObject();
                orc.addProperty("id", rs.getLong("id"));
                orc.addProperty("clienteId", rs.getLong("cliente_id"));
                orc.addProperty("clienteNome", rs.getString("cliente_nome"));
                orc.addProperty("total", rs.getDouble("total"));
                orc.addProperty("status", rs.getString("status"));
                orc.addProperty("dataHora", rs.getString("data_hora"));
                orc.addProperty("qtdLentes", rs.getInt("qtd_lentes"));
                orc.addProperty("qtdProdutos", rs.getInt("qtd_produtos"));
                orc.addProperty("vendedor", rs.getString("vendedor"));  // ✅ NOVO
                
                // Busca itens do orçamento
                JsonArray itens = buscarItensOrcamento(conn, rs.getLong("id"));
                orc.add("itens", itens);
                
                orcamentos.add(orc);
            }
            
        } finally {
            if (rs != null) rs.close();
            if (stmt != null) stmt.close();
            if (conn != null) conn.close();
        }
        
        return orcamentos;
    }

    /**
     * Busca itens de um orçamento específico
     */
    private JsonArray buscarItensOrcamento(Connection conn, long orcamentoId) throws SQLException {
        JsonArray itens = new JsonArray();
        
        String sql = "SELECT * FROM orcamento_itens WHERE orcamento_id = ? ORDER BY tipo, id";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, orcamentoId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    JsonObject item = new JsonObject();
                    item.addProperty("id", rs.getString("item_id"));
                    item.addProperty("tipo", rs.getString("tipo"));
                    item.addProperty("codigo", rs.getInt("codigo"));
                    item.addProperty("descricao", rs.getString("descricao"));
                    item.addProperty("marca", rs.getString("marca"));
                    item.addProperty("olho", rs.getString("olho"));
                    item.addProperty("quantidade", rs.getDouble("quantidade"));
                    item.addProperty("precoUnitario", rs.getDouble("preco_unitario"));
                    item.addProperty("precoTotal", rs.getDouble("preco_total"));
                    item.addProperty("tratamentos", rs.getString("tratamentos_json"));
                    item.addProperty("coloracao", rs.getString("coloracao_json"));
                    
                    itens.add(item);
                }
            }
        }
        
        return itens;
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        doGet(request, response);
    }
}
