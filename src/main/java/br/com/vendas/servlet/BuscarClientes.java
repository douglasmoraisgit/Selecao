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
 * BuscarClientes.java
 * Servlet para buscar clientes (autocomplete)
 * 
 * ENDPOINT:
 * GET /BuscarClientes?termo=douglas
 * GET /BuscarClientes?cpf=270.183.138-56
 * GET /BuscarClientes?id=123
 * 
 * RETORNA:
 * {
 *   success: boolean,
 *   clientes: [
 *     { id, nome, cpf, telefone, whatsapp, email, dataCadastro, ... }
 *   ]
 * }
 * 
 * @author OptoFreela
 */
public class BuscarClientes extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private Gson gson = GsonUtils.getGson();

    public BuscarClientes() {
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
            String termo = request.getParameter("termo");
            String cpf = request.getParameter("cpf");
            String idStr = request.getParameter("id");
            
            Connection conn = ConnectionFactory.getInstance().getConnection();
            
            try {
                JsonArray clientes;
                
                if (idStr != null && !idStr.isEmpty()) {
                    // Busca por ID específico
                    clientes = buscarPorId(conn, Long.parseLong(idStr));
                } else if (cpf != null && !cpf.isEmpty()) {
                    // Busca por CPF exato
                    clientes = buscarPorCpf(conn, cpf);
                } else if (termo != null && !termo.isEmpty()) {
                    // Busca por termo (nome ou CPF parcial)
                    clientes = buscarPorTermo(conn, termo);
                } else {
                    // Retorna últimos clientes cadastrados
                    clientes = buscarRecentes(conn);
                }
                
                resultado.add("clientes", clientes);
                resultado.addProperty("total", clientes.size());
                resultado.addProperty("success", true);
                
            } finally {
                if (conn != null) conn.close();
            }
            
        } catch (Exception e) {
            System.err.println("❌ Erro ao buscar clientes: " + e.getMessage());
            e.printStackTrace();
            
            resultado.addProperty("success", false);
            resultado.addProperty("message", "Erro ao buscar clientes: " + e.getMessage());
        }
        
        out.print(gson.toJson(resultado));
        out.flush();
    }

    /**
     * Busca cliente por ID
     */
    private JsonArray buscarPorId(Connection conn, long id) throws SQLException {
        JsonArray clientes = new JsonArray();
        
        String sql = "SELECT * FROM clientes WHERE idCliente = ?";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    clientes.add(montarCliente(rs));
                }
            }
        }
        
        return clientes;
    }

    /**
     * Busca cliente por CPF exato
     */
    private JsonArray buscarPorCpf(Connection conn, String cpf) throws SQLException {
        JsonArray clientes = new JsonArray();
        
        // Remove formatação do CPF para busca
        String cpfLimpo = cpf.replaceAll("[^0-9]", "");
        
        String sql = "SELECT * FROM clientes WHERE REPLACE(REPLACE(cpfCliente, '.', ''), '-', '') = ? LIMIT 1";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, cpfLimpo);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    clientes.add(montarCliente(rs));
                }
            }
        }
        
        return clientes;
    }

    /**
     * Busca clientes por termo (nome ou CPF parcial)
     */
    private JsonArray buscarPorTermo(Connection conn, String termo) throws SQLException {
        JsonArray clientes = new JsonArray();
        
        String sql = "SELECT * FROM clientes " +
                     "WHERE nomeCliente LIKE ? " +
                     "   OR cpfCliente LIKE ? " +
                     "   OR whatsCliente LIKE ? " +
                     "   OR telefoneCliente LIKE ? " +
                     "ORDER BY nomeCliente " +
                     "LIMIT 10";
        
        String termoBusca = "%" + termo + "%";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, termoBusca);
            stmt.setString(2, termoBusca);
            stmt.setString(3, termoBusca);
            stmt.setString(4, termoBusca);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    clientes.add(montarCliente(rs));
                }
            }
        }
        
        return clientes;
    }

    /**
     * Retorna últimos clientes cadastrados
     */
    private JsonArray buscarRecentes(Connection conn) throws SQLException {
        JsonArray clientes = new JsonArray();
        
        String sql = "SELECT * FROM clientes ORDER BY idCliente DESC LIMIT 5";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                clientes.add(montarCliente(rs));
            }
        }
        
        return clientes;
    }

    /**
     * Monta objeto JSON do cliente
     */
    private JsonObject montarCliente(ResultSet rs) throws SQLException {
        JsonObject cliente = new JsonObject();
        
        cliente.addProperty("id", rs.getLong("idCliente"));
        cliente.addProperty("nome", rs.getString("nomeCliente"));
        cliente.addProperty("cpf", rs.getString("cpfCliente"));
        cliente.addProperty("rg", rs.getString("rgCliente"));
        cliente.addProperty("orgaoEmissor", rs.getString("orgaoEmissor"));
        cliente.addProperty("nascimento", rs.getString("nascimentoCliente"));
        cliente.addProperty("genero", rs.getString("generoCliente"));
        cliente.addProperty("whatsapp", rs.getString("whatsCliente"));
        cliente.addProperty("telefone", rs.getString("telefoneCliente"));
        cliente.addProperty("email", rs.getString("emailCliente"));
        cliente.addProperty("profissao", rs.getString("profissaoCliente"));
        cliente.addProperty("ocupacao", rs.getString("ocupacaoCliente"));
        cliente.addProperty("dataCadastro", rs.getString("dataCadastro"));
        cliente.addProperty("cadastradoPor", rs.getString("cadastradoPor"));
        cliente.addProperty("indicacao", rs.getString("indicacao"));
        cliente.addProperty("idConvenio", rs.getString("idConvenio"));
        
        // Endereço
        cliente.addProperty("cep", rs.getString("cepCliente"));
        cliente.addProperty("rua", rs.getString("ruaCliente"));
        cliente.addProperty("numero", rs.getString("numeroCliente"));
        cliente.addProperty("complemento", rs.getString("complementoCliente"));
        cliente.addProperty("bairro", rs.getString("bairroCliente"));
        cliente.addProperty("cidade", rs.getString("cidadeCliente"));
        cliente.addProperty("estado", rs.getString("estadoCliente"));
        
        return cliente;
    }
}
