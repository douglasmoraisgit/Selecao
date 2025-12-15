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
 * Servlet implementation class TratamentosCompativeis
 */
public class TratamentosCompativeis extends HttpServlet {
	
	  private static final long serialVersionUID = 1L;

	    @Override
	    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
	            throws ServletException, IOException {
	        
	        request.setCharacterEncoding("UTF-8");
	        response.setContentType("application/json;charset=UTF-8");
	        
	        String familia = request.getParameter("familia");
	        String tratamento = request.getParameter("tratamento");
	        
	        System.out.println("🔍 TratamentosCompativeis - familia: " + familia + ", tratamento: " + tratamento);
	        
	        Object resultado;
	        
	        try {
	            if (familia != null && !familia.isEmpty()) {
	                resultado = buscarTratamentosPorFamilia(familia);
	            } else if (tratamento != null && !tratamento.isEmpty()) {
	                resultado = buscarFamiliasPorTratamento(tratamento);
	            } else {
	                resultado = buscarTodosTratamentos();
	            }
	        } catch (SQLException e) {
	            e.printStackTrace();
	            resultado = new ErrorResponse("Erro ao buscar dados: " + e.getMessage());
	        }
	        
	        String json = new Gson().toJson(resultado);
	        System.out.println("📤 Resposta: " + json);
	        
	        PrintWriter out = response.getWriter();
	        out.print(json);
	        out.flush();
	    }

	    private TratamentosResponse buscarTratamentosPorFamilia(String nomeFamilia) throws SQLException {
	        List<TratamentoInfo> tratamentos = new ArrayList<>();
	        
	        String sql = """
	            SELECT t.id, t.nome, t.tipoTratamento, t.valor_venda, t.codigo_fornecedor
	            FROM tratamento t
	            INNER JOIN familia_tratamento ft ON t.id = ft.tratamento_id
	            INNER JOIN familia f ON ft.familia_id = f.id
	            WHERE f.nome = ?
	            ORDER BY t.nome
	        """;
	        
	        try (Connection conn = ConnectionFactory.getInstance().getConnection();
	             PreparedStatement stmt = conn.prepareStatement(sql)) {
	            
	            stmt.setString(1, nomeFamilia);
	            
	            try (ResultSet rs = stmt.executeQuery()) {
	                while (rs.next()) {
	                    TratamentoInfo t = new TratamentoInfo();
	                    t.id = rs.getInt("id");
	                    t.nome = rs.getString("nome");
	                    t.tipo = rs.getString("tipoTratamento");
	                    t.valor = rs.getDouble("valor_venda");
	                    t.codigo = rs.getString("codigo_fornecedor");
	                    tratamentos.add(t);
	                }
	            }
	        }
	        
	        TratamentosResponse resp = new TratamentosResponse();
	        resp.familia = nomeFamilia;
	        resp.tratamentos = tratamentos;
	        resp.total = tratamentos.size();
	        return resp;
	    }

	    private FamiliasResponse buscarFamiliasPorTratamento(String nomeTratamento) throws SQLException {
	        List<FamiliaInfo> familias = new ArrayList<>();
	        
	        String sql = """
	            SELECT f.id, f.nome
	            FROM familia f
	            INNER JOIN familia_tratamento ft ON f.id = ft.familia_id
	            INNER JOIN tratamento t ON ft.tratamento_id = t.id
	            WHERE t.nome = ?
	            ORDER BY f.nome
	        """;
	        
	        try (Connection conn = ConnectionFactory.getInstance().getConnection();
	             PreparedStatement stmt = conn.prepareStatement(sql)) {
	            
	            stmt.setString(1, nomeTratamento);
	            
	            try (ResultSet rs = stmt.executeQuery()) {
	                while (rs.next()) {
	                    FamiliaInfo f = new FamiliaInfo();
	                    f.id = rs.getInt("id");
	                    f.nome = rs.getString("nome");
	                    familias.add(f);
	                }
	            }
	        }
	        
	        FamiliasResponse resp = new FamiliasResponse();
	        resp.tratamento = nomeTratamento;
	        resp.familias = familias;
	        resp.total = familias.size();
	        return resp;
	    }

	    private TratamentosResponse buscarTodosTratamentos() throws SQLException {
	        List<TratamentoInfo> tratamentos = new ArrayList<>();
	        
	        String sql = """
	            SELECT id, nome, tipoTratamento, valor_venda, codigo_fornecedor
	            FROM tratamento
	            ORDER BY nome
	        """;
	        
	        try (Connection conn = ConnectionFactory.getInstance().getConnection();
	             PreparedStatement stmt = conn.prepareStatement(sql);
	             ResultSet rs = stmt.executeQuery()) {
	            
	            while (rs.next()) {
	                TratamentoInfo t = new TratamentoInfo();
	                t.id = rs.getInt("id");
	                t.nome = rs.getString("nome");
	                t.tipo = rs.getString("tipoTratamento");
	                t.valor = rs.getDouble("valor_venda");
	                t.codigo = rs.getString("codigo_fornecedor");
	                tratamentos.add(t);
	            }
	        }
	        
	        TratamentosResponse resp = new TratamentosResponse();
	        resp.tratamentos = tratamentos;
	        resp.total = tratamentos.size();
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
	    
	    private static class TratamentoInfo {
	        int id;
	        String nome;
	        String tipo;
	        double valor;
	        String codigo;
	    }
	    
	    private static class FamiliaInfo {
	        int id;
	        String nome;
	    }
	    
	    private static class TratamentosResponse {
	        String familia;
	        List<TratamentoInfo> tratamentos;
	        int total;
	    }
	    
	    private static class FamiliasResponse {
	        String tratamento;
	        List<FamiliaInfo> familias;
	        int total;
	    }
	    
	    private static class ErrorResponse {
	        String error;
	        ErrorResponse(String msg) { this.error = msg; }
	    }
	}