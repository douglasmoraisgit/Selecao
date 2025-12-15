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
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class Coloracao
 */
public class Coloracao extends HttpServlet {
	 private static final long serialVersionUID = 1L;

	    @Override
	    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
	            throws ServletException, IOException {
	        
	        request.setCharacterEncoding("UTF-8");
	        response.setContentType("application/json;charset=UTF-8");
	        
	        String tipo = request.getParameter("tipo");
	        
	        System.out.println("🎨 Coloracoes - tipo: " + tipo);
	        
	        Object resultado;
	        
	        try {
	            if (tipo != null && !tipo.isEmpty()) {
	                resultado = buscarPorTipo(tipo);
	            } else {
	                resultado = buscarTodas();
	            }
	        } catch (SQLException e) {
	            e.printStackTrace();
	            resultado = new ErrorResponse("Erro ao buscar colorações: " + e.getMessage());
	        }
	        
	        String json = new Gson().toJson(resultado);
	        System.out.println("📤 Resposta: " + json);
	        
	        PrintWriter out = response.getWriter();
	        out.print(json);
	        out.flush();
	    }

	    /**
	     * Busca colorações por tipo (Total ou Degradê)
	     */
	    private ColoracoesResponse buscarPorTipo(String tipo) throws SQLException {
	        List<ColoracaoInfo> coloracoes = new ArrayList<>();
	        
	        String sql = """
	            SELECT id, tipo, nome, codigo_fornecedor, valor_venda, cor_hex
	            FROM coloracao
	            WHERE tipo = ? AND ativo = TRUE
	            ORDER BY nome
	        """;
	        
	        System.out.println("🔍 Buscando colorações tipo: " + tipo);
	        
	        try (Connection conn = ConnectionFactory.getInstance().getConnection();
	             PreparedStatement stmt = conn.prepareStatement(sql)) {
	            
	            stmt.setString(1, tipo);
	            
	            try (ResultSet rs = stmt.executeQuery()) {
	                while (rs.next()) {
	                    ColoracaoInfo c = new ColoracaoInfo();
	                    c.id = rs.getInt("id");
	                    c.tipo = rs.getString("tipo");
	                    c.nome = rs.getString("nome");
	                    c.codigo = rs.getString("codigo_fornecedor");
	                    c.valor = rs.getDouble("valor_venda");
	                    c.corHex = rs.getString("cor_hex");
	                    coloracoes.add(c);
	                }
	            }
	        }
	        
	        ColoracoesResponse resp = new ColoracoesResponse();
	        resp.tipo = tipo;
	        resp.coloracoes = coloracoes;
	        resp.total = coloracoes.size();
	        
	        System.out.println("📦 Total colorações encontradas: " + coloracoes.size());
	        return resp;
	    }

	    /**
	     * Busca todas as colorações ativas
	     */
	    private ColoracoesResponse buscarTodas() throws SQLException {
	        List<ColoracaoInfo> coloracoes = new ArrayList<>();
	        
	        String sql = """
	            SELECT id, tipo, nome, codigo_fornecedor, valor_venda, cor_hex
	            FROM coloracao
	            WHERE ativo = TRUE
	            ORDER BY tipo, nome
	        """;
	        
	        System.out.println("🔍 Buscando todas as colorações");
	        
	        try (Connection conn = ConnectionFactory.getInstance().getConnection();
	             PreparedStatement stmt = conn.prepareStatement(sql);
	             ResultSet rs = stmt.executeQuery()) {
	            
	            while (rs.next()) {
	                ColoracaoInfo c = new ColoracaoInfo();
	                c.id = rs.getInt("id");
	                c.tipo = rs.getString("tipo");
	                c.nome = rs.getString("nome");
	                c.codigo = rs.getString("codigo_fornecedor");
	                c.valor = rs.getDouble("valor_venda");
	                c.corHex = rs.getString("cor_hex");
	                coloracoes.add(c);
	            }
	        }
	        
	        ColoracoesResponse resp = new ColoracoesResponse();
	        resp.coloracoes = coloracoes;
	        resp.total = coloracoes.size();
	        
	        System.out.println("📦 Total colorações: " + coloracoes.size());
	        return resp;
	    }

	    @Override
	    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
	            throws ServletException, IOException {
	        doGet(request, response);
	    }

	    // ========================================
	    // DTOs internos
	    // ========================================
	    
	    private static class ColoracaoInfo {
	        int id;
	        String tipo;
	        String nome;
	        String codigo;
	        double valor;
	        String corHex;
	    }
	    
	    private static class ColoracoesResponse {
	        String tipo;
	        List<ColoracaoInfo> coloracoes;
	        int total;
	    }
	    
	    private static class ErrorResponse {
	        String error;
	        ErrorResponse(String msg) { this.error = msg; }
	    }
	}
