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

import br.com.vendas.beans.Tratamento;
import br.com.vendas.dao.ConnectionFactory;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Servlet para buscar tratamentos permitidos para uma lente/família/marca
 * 
 * Parâmetros aceitos (em ordem de prioridade):
 * - lenteId: Código da lente específica
 * - familiaId: Código da família de lentes
 * - marcaId: Código da marca
 * 
 * Retorna JSON com lista de tratamentos disponíveis
 * 
 * @author OptoFreela
 */
public class TratamentosPermitidos extends HttpServlet {
    private static final long serialVersionUID = 1L;

    public TratamentosPermitidos() {
        super();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
        
        // Parâmetros
        String lenteIdParam = request.getParameter("lenteId");
        String familiaIdParam = request.getParameter("familiaId");
        String marcaIdParam = request.getParameter("marcaId");
        
        List<Tratamento> tratamentos = new ArrayList<>();
        
        try {
            // Busca por prioridade: lente > família > marca
            if (lenteIdParam != null && !lenteIdParam.isEmpty()) {
                int lenteId = Integer.parseInt(lenteIdParam);
                tratamentos = buscarPorLente(lenteId);
            }
            
            // Se não encontrou por lente, tenta por família
            if (tratamentos.isEmpty() && familiaIdParam != null && !familiaIdParam.isEmpty()) {
                int familiaId = Integer.parseInt(familiaIdParam);
                tratamentos = buscarPorFamilia(familiaId);
            }
            
            // Se não encontrou por família, tenta por marca
            if (tratamentos.isEmpty() && marcaIdParam != null && !marcaIdParam.isEmpty()) {
                int marcaId = Integer.parseInt(marcaIdParam);
                tratamentos = buscarPorMarca(marcaId);
            }
            
            // Se ainda não encontrou, busca tratamentos padrão (todos disponíveis)
            if (tratamentos.isEmpty()) {
                tratamentos = buscarTratamentosPadrao();
            }
            
        } catch (NumberFormatException e) {
            System.err.println("Erro ao converter parâmetro: " + e.getMessage());
        } catch (SQLException e) {
            System.err.println("Erro SQL ao buscar tratamentos: " + e.getMessage());
            e.printStackTrace();
        }
        
        // Monta resposta JSON
        TratamentosResponse resp = new TratamentosResponse();
        resp.tratamentos = tratamentos;
        resp.total = tratamentos.size();
        
        Gson gson = new Gson();
        String json = gson.toJson(resp);
        
        PrintWriter out = response.getWriter();
        out.print(json);
        out.flush();
    }

    /**
     * Busca tratamentos permitidos para uma lente específica
     */
    private List<Tratamento> buscarPorLente(int lenteId) throws SQLException {
        List<Tratamento> tratamentos = new ArrayList<>();
        
        String sql = """
            SELECT t.codigo, t.nome, t.codigo_fornecedor, t.valor_venda, tp.obrigatorio
            FROM tratamentos t
            INNER JOIN tratamentos_permitidos tp ON t.codigo = tp.codigo_tratamento
            WHERE tp.tipo_associacao = 'LENTE' 
              AND tp.codigo_item = ?
              AND t.ativo = true
            ORDER BY tp.obrigatorio DESC, t.nome ASC
        """;
        
        try (Connection conn =  ConnectionFactory.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, lenteId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Tratamento t = new Tratamento();
                    t.setCodigo(rs.getInt("codigo"));
                    t.setNome(rs.getString("nome"));
                    t.setCodigo_fornecedor(rs.getString("codigo_fornecedor"));
                    t.setValorVenda(rs.getDouble("valor_venda"));
                    t.setObrigatorio(rs.getBoolean("obrigatorio"));
                    tratamentos.add(t);
                }
            }
        }
        
        return tratamentos;
    }

    /**
     * Busca tratamentos permitidos para uma família de lentes
     */
    private List<Tratamento> buscarPorFamilia(int familiaId) throws SQLException {
        List<Tratamento> tratamentos = new ArrayList<>();
        
        String sql = """
            SELECT t.codigo, t.nome, t.codigo_fornecedor, t.valor_venda, tp.obrigatorio
            FROM tratamentos t
            INNER JOIN tratamentos_permitidos tp ON t.codigo = tp.codigo_tratamento
            WHERE tp.tipo_associacao = 'FAMILIA' 
              AND tp.codigo_item = ?
              AND t.ativo = true
            ORDER BY tp.obrigatorio DESC, t.nome ASC
        """;
        
        try (Connection conn =  ConnectionFactory.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, familiaId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Tratamento t = new Tratamento();
                    t.setCodigo(rs.getInt("codigo"));
                    t.setNome(rs.getString("nome"));
                    t.setCodigo_fornecedor(rs.getString("codigo_fornecedor"));
                    t.setValorVenda(rs.getDouble("valor_venda"));
                    t.setObrigatorio(rs.getBoolean("obrigatorio"));
                    tratamentos.add(t);
                }
            }
        }
        
        return tratamentos;
    }

    /**
     * Busca tratamentos permitidos para uma marca
     */
    private List<Tratamento> buscarPorMarca(int marcaId) throws SQLException {
        List<Tratamento> tratamentos = new ArrayList<>();
        
        String sql = """
            SELECT t.codigo, t.nome, t.codigo_fornecedor, t.valor_venda, tp.obrigatorio
            FROM tratamentos t
            INNER JOIN tratamentos_permitidos tp ON t.codigo = tp.codigo_tratamento
            WHERE tp.tipo_associacao = 'MARCA' 
              AND tp.codigo_item = ?
              AND t.ativo = true
            ORDER BY tp.obrigatorio DESC, t.nome ASC
        """;
        
        try (Connection conn =  ConnectionFactory.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, marcaId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Tratamento t = new Tratamento();
                    t.setCodigo(rs.getInt("codigo"));
                    t.setNome(rs.getString("nome"));
                    t.setCodigo_fornecedor(rs.getString("codigo_fornecedor"));
                    t.setValorVenda(rs.getDouble("valor_venda"));
                    t.setObrigatorio(rs.getBoolean("obrigatorio"));
                    tratamentos.add(t);
                }
            }
        }
        
        return tratamentos;
    }

    /**
     * Busca todos os tratamentos ativos (fallback)
     */
    private List<Tratamento> buscarTratamentosPadrao() throws SQLException {
        List<Tratamento> tratamentos = new ArrayList<>();
        
        String sql = """
            SELECT codigo, nome, codigo_fornecedor, valor_venda, false as obrigatorio
            FROM tratamentos
            WHERE ativo = true
            ORDER BY nome ASC
        """;
        
        try (Connection conn =  ConnectionFactory.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                Tratamento t = new Tratamento();
                t.setCodigo(rs.getInt("codigo"));
                t.setNome(rs.getString("nome"));
                t.setCodigo_fornecedor(rs.getString("codigo_fornecedor"));
                t.setValorVenda(rs.getDouble("valor_venda"));
                t.setObrigatorio(rs.getBoolean("obrigatorio"));
                tratamentos.add(t);
            }
        }
        
        return tratamentos;
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        doGet(request, response);
    }
    
    /**
     * Classe interna para resposta JSON
     */
    private static class TratamentosResponse {
        List<Tratamento> tratamentos;
        int total;
    }
}
