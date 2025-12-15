package br.com.vendas.servlet;

import java.io.IOException;
import java.io.PrintWriter;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

/**
 * UsuarioLogado.java
 * Retorna dados do usuário logado em JSON
 * 
 * ENDPOINT:
 * GET /UsuarioLogado
 * 
 * RETORNO:
 * {
 *   "logado": true/false,
 *   "usuario": {
 *     "id": 1,
 *     "nome": "João Silva",
 *     "username": "joao",
 *     "email": "joao@email.com",
 *     "iniciais": "JS"
 *   },
 *   "loja": {
 *     "id": 1,
 *     "nome": "Ótica Central"
 *   },
 *   "perfil": {
 *     "id": 1,
 *     "nome": "Vendedor"
 *   }
 * }
 * 
 * @author OptoFreela
 */
public class UsuarioLogado extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        JsonObject resultado = new JsonObject();
        
        HttpSession session = request.getSession(false);
        
        // Verifica se está logado
        if (session == null || session.getAttribute("usuario") == null) {
            resultado.addProperty("logado", false);
            out.print(gson.toJson(resultado));
            out.flush();
            return;
        }
        
        resultado.addProperty("logado", true);
        
        // Dados do usuário
        JsonObject usuario = new JsonObject();
        
        Integer usuarioId = (Integer) session.getAttribute("usuarioId");
        String usuarioNome = (String) session.getAttribute("usuarioNome");
        String usuarioUsername = (String) session.getAttribute("usuarioUsername");
        
        usuario.addProperty("id", usuarioId != null ? usuarioId : 0);
        usuario.addProperty("nome", usuarioNome != null ? usuarioNome : "");
        usuario.addProperty("username", usuarioUsername != null ? usuarioUsername : "");
        
        // Calcula iniciais
        String iniciais = calcularIniciais(usuarioNome);
        usuario.addProperty("iniciais", iniciais);
        
        resultado.add("usuario", usuario);
        
        // Dados da loja
        Integer lojaId = (Integer) session.getAttribute("lojaId");
        String lojaNome = (String) session.getAttribute("lojaNome");
        
        if (lojaId != null && lojaId > 0) {
            JsonObject loja = new JsonObject();
            loja.addProperty("id", lojaId);
            loja.addProperty("nome", lojaNome != null ? lojaNome : "");
            resultado.add("loja", loja);
        }
        
        // Dados do perfil
        Integer perfilId = (Integer) session.getAttribute("perfilId");
        String perfilNome = (String) session.getAttribute("perfilNome");
        
        if (perfilId != null && perfilId > 0) {
            JsonObject perfil = new JsonObject();
            perfil.addProperty("id", perfilId);
            perfil.addProperty("nome", perfilNome != null ? perfilNome : "");
            resultado.add("perfil", perfil);
        }
        
        out.print(gson.toJson(resultado));
        out.flush();
    }
    
    /**
     * Calcula as iniciais do nome
     * "João Silva" -> "JS"
     * "Maria" -> "M"
     */
    private String calcularIniciais(String nome) {
        if (nome == null || nome.trim().isEmpty()) {
            return "?";
        }
        
        String[] partes = nome.trim().split("\\s+");
        
        if (partes.length == 1) {
            return partes[0].substring(0, 1).toUpperCase();
        }
        
        String primeira = partes[0].substring(0, 1);
        String ultima = partes[partes.length - 1].substring(0, 1);
        
        return (primeira + ultima).toUpperCase();
    }
}
