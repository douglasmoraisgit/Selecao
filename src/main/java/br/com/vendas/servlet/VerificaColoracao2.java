
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

import br.com.vendas.dao.ConnectionFactory;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Servlet para verificar se família/marca permite coloração.
 * 
 * Uso:
 * GET /VerificaColoracao?familia=Ultra
 * GET /VerificaColoracao?marca=Kodak
 * 
 * Resposta:
 * { "permiteColorir": true/false, "familias": [...] }
 * 
 * @author OptoFreela
 */
public class VerificaColoracao2 extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        System.out.println("============================================");
        System.out.println("🎨 VERIFICA COLORACAO - SERVLET CHAMADO!");
        System.out.println("============================================");
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        String familia = request.getParameter("familia");
        String marca = request.getParameter("marca");
        
        System.out.println("📥 Parâmetros recebidos:");
        System.out.println("   familia = " + familia);
        System.out.println("   marca = " + marca);
        System.out.println("🎨 VerificaColoracao - Família: " + familia + ", Marca: " + marca);
        
        try (PrintWriter out = response.getWriter()) {
            Gson gson = new Gson();
            RespostaColoracao resposta = new RespostaColoracao();
            
            if (familia != null && !familia.isEmpty()) {
                // Verifica se família permite colorir
                resposta.permiteColorir = verificaFamiliaPermiteColorir(familia);
                System.out.println("   → Família " + familia + " permite colorir: " + resposta.permiteColorir);
            } else if (marca != null && !marca.isEmpty()) {
                // Verifica se marca permite colorir
                resposta.permiteColorir = verificaMarcaPermiteColorir(marca);
                System.out.println("   → Marca " + marca + " permite colorir: " + resposta.permiteColorir);
            } else {
                // Sem parâmetro: retorna famílias que permitem colorir
                resposta.familias = getFamiliasQuePermitemColorir();
                resposta.permiteColorir = true;
                System.out.println("   → Total famílias que permitem colorir: " + resposta.familias.size());
            }
            
            String jsonResponse = gson.toJson(resposta);
            System.out.println("📤 Resposta JSON: " + jsonResponse);
            out.print(jsonResponse);
            
        } catch (SQLException e) {
            System.out.println("❌ ERRO SQL no VerificaColoracao:");
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            System.out.println("❌ ERRO GERAL no VerificaColoracao:");
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Verifica se algum produto da família permite colorir
     */
    private boolean verificaFamiliaPermiteColorir(String familia) throws SQLException {
        String sql = "SELECT COUNT(*) as total, SUM(CASE WHEN permite_colorir = 'Sim' THEN 1 ELSE 0 END) as permite FROM produtoteste WHERE familia = ?";
        
        try (Connection conn = ConnectionFactory.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, familia);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    int total = rs.getInt("total");
                    int permite = rs.getInt("permite");
                    System.out.println("   📊 Família '" + familia + "': " + permite + "/" + total + " produtos permitem colorir");
                    return permite > 0;
                }
            }
        }
        
        System.out.println("   ⚠️ Família '" + familia + "' não encontrada");
        return false;
    }

    /**
     * Verifica se algum produto da marca permite colorir
     */
    private boolean verificaMarcaPermiteColorir(String marca) throws SQLException {
        String sql = "SELECT COUNT(*) as total, SUM(CASE WHEN permite_colorir = 'Sim' THEN 1 ELSE 0 END) as permite FROM produtoteste WHERE marca = ?";
        
        try (Connection conn = ConnectionFactory.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, marca);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    int total = rs.getInt("total");
                    int permite = rs.getInt("permite");
                    System.out.println("   📊 Marca '" + marca + "': " + permite + "/" + total + " produtos permitem colorir");
                    return permite > 0;
                }
            }
        }
        
        System.out.println("   ⚠️ Marca '" + marca + "' não encontrada");
        return false;
    }

    /**
     * Retorna lista de famílias que permitem colorir
     */
    private List<FamiliaColoracao> getFamiliasQuePermitemColorir() throws SQLException {
        List<FamiliaColoracao> familias = new ArrayList<>();
        
        // Query com contagem para log
        String sql = "SELECT familia, COUNT(*) as total FROM produtoteste WHERE permite_colorir = 'Sim' GROUP BY familia ORDER BY familia";
        
        try (Connection conn = ConnectionFactory.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            System.out.println("   📋 Famílias que permitem colorir:");
            while (rs.next()) {
                FamiliaColoracao f = new FamiliaColoracao();
                f.nome = rs.getString("familia");
                int total = rs.getInt("total");
                familias.add(f);
                System.out.println("      ✅ " + f.nome + " (" + total + " produtos)");
            }
        }
        
        // Log das famílias que NÃO permitem
        String sqlNao = "SELECT DISTINCT familia FROM produtoteste WHERE permite_colorir = 'Não' AND familia NOT IN (SELECT DISTINCT familia FROM produtoteste WHERE permite_colorir = 'Sim')";
        try (Connection conn = ConnectionFactory.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sqlNao);
             ResultSet rs = stmt.executeQuery()) {
            
            boolean temNao = false;
            while (rs.next()) {
                if (!temNao) {
                    System.out.println("   📋 Famílias que NÃO permitem colorir:");
                    temNao = true;
                }
                System.out.println("      ❌ " + rs.getString("familia"));
            }
        }
        
        return familias;
    }
    
    // Classes internas para JSON
    private static class RespostaColoracao {
        boolean permiteColorir;
        List<FamiliaColoracao> familias;
    }
    
    private static class FamiliaColoracao {
        String nome;
    }
}