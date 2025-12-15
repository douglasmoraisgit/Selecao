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
 * ConfiguracoesPagamento.java
 * Servlet para carregar configurações da tela de pagamento
 * 
 * ENDPOINT:
 * GET /ConfiguracoesPagamento
 * 
 * RETORNA:
 * {
 *   success: boolean,
 *   formasPagamento: [...],
 *   bandeiras: [...],
 *   convenios: [...]
 * }
 * 
 * @author OptoFreela
 */
public class ConfiguracoesPagamento extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private Gson gson = GsonUtils.getGson();

    public ConfiguracoesPagamento() {
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
            System.out.println("╔════════════════════════════════════════════════════════════════╗");
            System.out.println("║  ⚙️ CARREGANDO CONFIGURAÇÕES DE PAGAMENTO                      ║");
            System.out.println("╚════════════════════════════════════════════════════════════════╝");
            
            Connection conn = ConnectionFactory.getInstance().getConnection();
            
            try {
                // 1. Formas de Pagamento
                JsonArray formasPagamento = carregarFormasPagamento(conn);
                resultado.add("formasPagamento", formasPagamento);
                
                // 2. Bandeiras de Cartão
                JsonArray bandeiras = carregarBandeiras(conn);
                resultado.add("bandeiras", bandeiras);
                
                // 3. Convênios
                JsonArray convenios = carregarConvenios(conn);
                resultado.add("convenios", convenios);
                
                resultado.addProperty("success", true);
                
                System.out.println("✅ Configurações carregadas:");
                System.out.println("   Formas: " + formasPagamento.size());
                System.out.println("   Bandeiras: " + bandeiras.size());
                System.out.println("   Convênios: " + convenios.size());
                
            } finally {
                if (conn != null) conn.close();
            }
            
        } catch (Exception e) {
            System.err.println("❌ Erro ao carregar configurações: " + e.getMessage());
            e.printStackTrace();
            
            resultado.addProperty("success", false);
            resultado.addProperty("message", "Erro ao carregar configurações: " + e.getMessage());
            
            // Retorna valores padrão em caso de erro
            resultado.add("formasPagamento", getFormasPadrao());
            resultado.add("bandeiras", getBandeirasPadrao());
            resultado.add("convenios", new JsonArray());
        }
        
        out.print(gson.toJson(resultado));
        out.flush();
    }

    /**
     * Carrega formas de pagamento do banco
     */
    private JsonArray carregarFormasPagamento(Connection conn) throws SQLException {
        JsonArray formas = new JsonArray();
        
        String sql = "SELECT * FROM formas_pagamento WHERE ativo = TRUE ORDER BY ordem";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                JsonObject forma = new JsonObject();
                forma.addProperty("codigo", rs.getString("codigo"));
                forma.addProperty("nome", rs.getString("nome"));
                forma.addProperty("icon", rs.getString("icon"));
                forma.addProperty("permite_parcelamento", rs.getBoolean("permite_parcelamento"));
                forma.addProperty("max_parcelas", rs.getInt("max_parcelas"));
                forma.addProperty("requer_bandeira", rs.getBoolean("requer_bandeira"));
                forma.addProperty("requer_convenio", rs.getBoolean("requer_convenio"));
                forma.addProperty("requer_autorizacao", rs.getBoolean("requer_autorizacao"));
                formas.add(forma);
            }
        } catch (SQLException e) {
            // Se tabela não existe, retorna padrão
            System.out.println("⚠️ Tabela formas_pagamento não encontrada, usando valores padrão");
            return getFormasPadrao();
        }
        
        // Se não encontrou nenhum, retorna padrão
        if (formas.size() == 0) {
            return getFormasPadrao();
        }
        
        return formas;
    }

    /**
     * Carrega bandeiras de cartão do banco
     */
    private JsonArray carregarBandeiras(Connection conn) throws SQLException {
        JsonArray bandeiras = new JsonArray();
        
        String sql = "SELECT * FROM bandeiras_cartao WHERE ativo = TRUE ORDER BY ordem";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                JsonObject bandeira = new JsonObject();
                bandeira.addProperty("codigo", rs.getString("codigo"));
                bandeira.addProperty("nome", rs.getString("nome"));
                bandeiras.add(bandeira);
            }
        } catch (SQLException e) {
            System.out.println("⚠️ Tabela bandeiras_cartao não encontrada, usando valores padrão");
            return getBandeirasPadrao();
        }
        
        if (bandeiras.size() == 0) {
            return getBandeirasPadrao();
        }
        
        return bandeiras;
    }

    /**
     * Carrega convênios do banco
     */
    private JsonArray carregarConvenios(Connection conn) throws SQLException {
        JsonArray convenios = new JsonArray();
        
        String sql = "SELECT id_empresa_convenio, razao_social, nome_fantasia, " +
                     "limite_credito, limite_por_funcionario, percentual_desconto, tipo_convenio " +
                     "FROM empresas_convenio WHERE status_convenio = 'ativo' ORDER BY nome_fantasia";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                JsonObject convenio = new JsonObject();
                convenio.addProperty("id", rs.getLong("id_empresa_convenio"));
                convenio.addProperty("razao_social", rs.getString("razao_social"));
                convenio.addProperty("nome_fantasia", rs.getString("nome_fantasia"));
                convenio.addProperty("limite_credito", rs.getDouble("limite_credito"));
                convenio.addProperty("limite_por_funcionario", rs.getDouble("limite_por_funcionario"));
                convenio.addProperty("percentual_desconto", rs.getDouble("percentual_desconto"));
                convenio.addProperty("tipo_convenio", rs.getString("tipo_convenio"));
                convenios.add(convenio);
            }
        } catch (SQLException e) {
            System.out.println("⚠️ Erro ao carregar convênios: " + e.getMessage());
            // Convênios é opcional, retorna array vazio
        }
        
        return convenios;
    }

    /**
     * Retorna formas de pagamento padrão
     */
    private JsonArray getFormasPadrao() {
        JsonArray formas = new JsonArray();
        
        formas.add(criarForma("DINHEIRO", "Dinheiro", "💵", false, 1, false, false, false));
        formas.add(criarForma("CREDITO", "Cartão de Crédito", "💳", true, 12, true, false, false));
        formas.add(criarForma("DEBITO", "Cartão de Débito", "💳", false, 1, true, false, false));
        formas.add(criarForma("PIX", "PIX", "📱", false, 1, false, false, false));
        formas.add(criarForma("CHEQUE", "Cheque", "📄", true, 6, false, false, false));
        formas.add(criarForma("CONVENIO", "Convênio", "🏢", true, 12, false, true, true));
        formas.add(criarForma("CREDIARIO", "Crediário", "📋", true, 24, false, false, false));
        formas.add(criarForma("SALDO_RECEBER", "Saldo a Receber", "⏳", false, 1, false, false, false));
        
        return formas;
    }

    /**
     * Cria objeto de forma de pagamento
     */
    private JsonObject criarForma(String codigo, String nome, String icon, 
                                   boolean parcelamento, int maxParcelas,
                                   boolean bandeira, boolean convenio, boolean autorizacao) {
        JsonObject forma = new JsonObject();
        forma.addProperty("codigo", codigo);
        forma.addProperty("nome", nome);
        forma.addProperty("icon", icon);
        forma.addProperty("permite_parcelamento", parcelamento);
        forma.addProperty("max_parcelas", maxParcelas);
        forma.addProperty("requer_bandeira", bandeira);
        forma.addProperty("requer_convenio", convenio);
        forma.addProperty("requer_autorizacao", autorizacao);
        return forma;
    }

    /**
     * Retorna bandeiras padrão
     */
    private JsonArray getBandeirasPadrao() {
        JsonArray bandeiras = new JsonArray();
        
        String[][] dados = {
            {"VISA", "Visa"},
            {"MASTERCARD", "Mastercard"},
            {"ELO", "Elo"},
            {"HIPERCARD", "Hipercard"},
            {"AMEX", "American Express"},
            {"OUTROS", "Outros"}
        };
        
        for (String[] b : dados) {
            JsonObject bandeira = new JsonObject();
            bandeira.addProperty("codigo", b[0]);
            bandeira.addProperty("nome", b[1]);
            bandeiras.add(bandeira);
        }
        
        return bandeiras;
    }
}