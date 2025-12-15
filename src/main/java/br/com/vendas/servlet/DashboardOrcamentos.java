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
import br.com.vendas.util.GsonUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class DashboardOrcamentos
 */
public class DashboardOrcamentos extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private Gson gson = GsonUtils.getGson();

    public DashboardOrcamentos() {
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
            // Parâmetro de período (dias)
            String periodoStr = request.getParameter("periodo");
            int periodo = 30; // Default: 30 dias
            
            if (periodoStr != null && !periodoStr.isEmpty()) {
                try {
                    periodo = Integer.parseInt(periodoStr);
                } catch (NumberFormatException e) {
                    periodo = 30;
                }
            }
            
            System.out.println("╔════════════════════════════════════════════════════════════════╗");
            System.out.println("║  📊 DASHBOARD DE ORÇAMENTOS                                    ║");
            System.out.println("╚════════════════════════════════════════════════════════════════╝");
            System.out.println("Período: últimos " + periodo + " dias");
            
            Connection conn = ConnectionFactory.getInstance().getConnection();
            
            try {
                // 1. Métricas principais
                JsonObject metricas = getMetricasPrincipais(conn, periodo);
                resultado.add("metricas", metricas);
                
                // 2. Orçamentos por dia (para gráfico de linha)
                JsonArray porDia = getOrcamentosPorDia(conn, periodo);
                resultado.add("porDia", porDia);
                
                // 3. Distribuição por status (para gráfico de pizza)
                JsonArray porStatus = getDistribuicaoPorStatus(conn, periodo);
                resultado.add("porStatus", porStatus);
                
                // 4. Top clientes
                JsonArray topClientes = getTopClientes(conn, periodo);
                resultado.add("topClientes", topClientes);
                
                // 5. Últimos orçamentos
                JsonArray ultimos = getUltimosOrcamentos(conn, 5);
                resultado.add("ultimosOrcamentos", ultimos);
                
                // 6. Comparativo com período anterior
                JsonObject comparativo = getComparativoPeriodo(conn, periodo);
                resultado.add("comparativo", comparativo);
                
                resultado.addProperty("success", true);
                resultado.addProperty("periodo", periodo);
                
            } finally {
                if (conn != null) conn.close();
            }
            
        } catch (Exception e) {
            System.err.println("❌ Erro ao gerar dashboard: " + e.getMessage());
            e.printStackTrace();
            
            resultado.addProperty("success", false);
            resultado.addProperty("message", "Erro ao gerar dashboard: " + e.getMessage());
        }
        
        out.print(gson.toJson(resultado));
        out.flush();
    }

    /**
     * Obtém métricas principais
     */
    private JsonObject getMetricasPrincipais(Connection conn, int periodo) throws SQLException {
        JsonObject metricas = new JsonObject();
        
        String sql = 
            "SELECT " +
            "  COUNT(*) as total, " +
            "  SUM(CASE WHEN status = 'PENDENTE' THEN 1 ELSE 0 END) as pendentes, " +
            "  SUM(CASE WHEN status = 'CONVERTIDO' THEN 1 ELSE 0 END) as convertidos, " +
            "  SUM(CASE WHEN status = 'EXPIRADO' THEN 1 ELSE 0 END) as expirados, " +
            "  COALESCE(SUM(total), 0) as valor_total, " +
            "  COALESCE(AVG(total), 0) as valor_medio, " +
            "  COALESCE(SUM(CASE WHEN status = 'CONVERTIDO' THEN total ELSE 0 END), 0) as valor_convertido " +
            "FROM orcamentos " +
            "WHERE data_hora >= DATE_SUB(NOW(), INTERVAL ? DAY)";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, periodo);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    int total = rs.getInt("total");
                    int pendentes = rs.getInt("pendentes");
                    int convertidos = rs.getInt("convertidos");
                    int expirados = rs.getInt("expirados");
                    double valorTotal = rs.getDouble("valor_total");
                    double valorMedio = rs.getDouble("valor_medio");
                    double valorConvertido = rs.getDouble("valor_convertido");
                    
                    metricas.addProperty("total", total);
                    metricas.addProperty("pendentes", pendentes);
                    metricas.addProperty("convertidos", convertidos);
                    metricas.addProperty("expirados", expirados);
                    metricas.addProperty("valorTotal", valorTotal);
                    metricas.addProperty("valorMedio", valorMedio);
                    metricas.addProperty("valorConvertido", valorConvertido);
                    
                    // Taxa de conversão
                    double taxaConversao = total > 0 ? (convertidos * 100.0 / total) : 0;
                    metricas.addProperty("taxaConversao", Math.round(taxaConversao * 10) / 10.0);
                    
                    // Ticket médio (valor médio dos convertidos)
                    double ticketMedio = convertidos > 0 ? valorConvertido / convertidos : 0;
                    metricas.addProperty("ticketMedio", ticketMedio);
                }
            }
        }
        
        return metricas;
    }

    /**
     * Obtém orçamentos agrupados por dia
     */
    private JsonArray getOrcamentosPorDia(Connection conn, int periodo) throws SQLException {
        JsonArray resultado = new JsonArray();
        
        String sql = 
            "SELECT " +
            "  DATE(data_hora) as dia, " +
            "  COUNT(*) as quantidade, " +
            "  SUM(total) as valor, " +
            "  SUM(CASE WHEN status = 'CONVERTIDO' THEN 1 ELSE 0 END) as convertidos " +
            "FROM orcamentos " +
            "WHERE data_hora >= DATE_SUB(NOW(), INTERVAL ? DAY) " +
            "GROUP BY DATE(data_hora) " +
            "ORDER BY dia ASC";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, periodo);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    JsonObject dia = new JsonObject();
                    dia.addProperty("dia", rs.getString("dia"));
                    dia.addProperty("quantidade", rs.getInt("quantidade"));
                    dia.addProperty("valor", rs.getDouble("valor"));
                    dia.addProperty("convertidos", rs.getInt("convertidos"));
                    resultado.add(dia);
                }
            }
        }
        
        return resultado;
    }

    /**
     * Obtém distribuição por status
     */
    private JsonArray getDistribuicaoPorStatus(Connection conn, int periodo) throws SQLException {
        JsonArray resultado = new JsonArray();
        
        String sql = 
            "SELECT " +
            "  status, " +
            "  COUNT(*) as quantidade, " +
            "  SUM(total) as valor " +
            "FROM orcamentos " +
            "WHERE data_hora >= DATE_SUB(NOW(), INTERVAL ? DAY) " +
            "GROUP BY status " +
            "ORDER BY quantidade DESC";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, periodo);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    JsonObject status = new JsonObject();
                    status.addProperty("status", rs.getString("status"));
                    status.addProperty("quantidade", rs.getInt("quantidade"));
                    status.addProperty("valor", rs.getDouble("valor"));
                    resultado.add(status);
                }
            }
        }
        
        return resultado;
    }

    /**
     * Obtém top clientes por valor
     */
    private JsonArray getTopClientes(Connection conn, int periodo) throws SQLException {
        JsonArray resultado = new JsonArray();
        
        String sql = 
            "SELECT " +
            "  cliente_nome, " +
            "  COUNT(*) as quantidade, " +
            "  SUM(total) as valor_total, " +
            "  SUM(CASE WHEN status = 'CONVERTIDO' THEN 1 ELSE 0 END) as convertidos " +
            "FROM orcamentos " +
            "WHERE data_hora >= DATE_SUB(NOW(), INTERVAL ? DAY) " +
            "  AND cliente_nome IS NOT NULL " +
            "  AND cliente_nome != 'Cliente não informado' " +
            "GROUP BY cliente_nome " +
            "ORDER BY valor_total DESC " +
            "LIMIT 5";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, periodo);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    JsonObject cliente = new JsonObject();
                    cliente.addProperty("nome", rs.getString("cliente_nome"));
                    cliente.addProperty("quantidade", rs.getInt("quantidade"));
                    cliente.addProperty("valorTotal", rs.getDouble("valor_total"));
                    cliente.addProperty("convertidos", rs.getInt("convertidos"));
                    resultado.add(cliente);
                }
            }
        }
        
        return resultado;
    }

    /**
     * Obtém últimos orçamentos
     */
    private JsonArray getUltimosOrcamentos(Connection conn, int limite) throws SQLException {
        JsonArray resultado = new JsonArray();
        
        String sql = 
            "SELECT id, cliente_nome, total, status, data_hora " +
            "FROM orcamentos " +
            "ORDER BY data_hora DESC " +
            "LIMIT ?";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, limite);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    JsonObject orc = new JsonObject();
                    orc.addProperty("id", rs.getLong("id"));
                    orc.addProperty("clienteNome", rs.getString("cliente_nome"));
                    orc.addProperty("total", rs.getDouble("total"));
                    orc.addProperty("status", rs.getString("status"));
                    orc.addProperty("dataHora", rs.getString("data_hora"));
                    resultado.add(orc);
                }
            }
        }
        
        return resultado;
    }

    /**
     * Compara com período anterior
     */
    private JsonObject getComparativoPeriodo(Connection conn, int periodo) throws SQLException {
        JsonObject comparativo = new JsonObject();
        
        // Período atual
        String sqlAtual = 
            "SELECT COUNT(*) as total, COALESCE(SUM(total), 0) as valor " +
            "FROM orcamentos " +
            "WHERE data_hora >= DATE_SUB(NOW(), INTERVAL ? DAY)";
        
        // Período anterior
        String sqlAnterior = 
            "SELECT COUNT(*) as total, COALESCE(SUM(total), 0) as valor " +
            "FROM orcamentos " +
            "WHERE data_hora >= DATE_SUB(NOW(), INTERVAL ? DAY) " +
            "  AND data_hora < DATE_SUB(NOW(), INTERVAL ? DAY)";
        
        int totalAtual = 0, totalAnterior = 0;
        double valorAtual = 0, valorAnterior = 0;
        
        try (PreparedStatement stmt = conn.prepareStatement(sqlAtual)) {
            stmt.setInt(1, periodo);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    totalAtual = rs.getInt("total");
                    valorAtual = rs.getDouble("valor");
                }
            }
        }
        
        try (PreparedStatement stmt = conn.prepareStatement(sqlAnterior)) {
            stmt.setInt(1, periodo * 2);
            stmt.setInt(2, periodo);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    totalAnterior = rs.getInt("total");
                    valorAnterior = rs.getDouble("valor");
                }
            }
        }
        
        // Calcula variação percentual
        double variacaoQuantidade = totalAnterior > 0 
            ? ((totalAtual - totalAnterior) * 100.0 / totalAnterior) 
            : (totalAtual > 0 ? 100 : 0);
            
        double variacaoValor = valorAnterior > 0 
            ? ((valorAtual - valorAnterior) * 100.0 / valorAnterior) 
            : (valorAtual > 0 ? 100 : 0);
        
        comparativo.addProperty("quantidadeAtual", totalAtual);
        comparativo.addProperty("quantidadeAnterior", totalAnterior);
        comparativo.addProperty("variacaoQuantidade", Math.round(variacaoQuantidade * 10) / 10.0);
        comparativo.addProperty("valorAtual", valorAtual);
        comparativo.addProperty("valorAnterior", valorAnterior);
        comparativo.addProperty("variacaoValor", Math.round(variacaoValor * 10) / 10.0);
        
        return comparativo;
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        doGet(request, response);
    }
}