package br.com.vendas.servlet;

import java.io.IOException;
import java.io.PrintWriter;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import br.com.vendas.beans.Usuario;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * SessionServlet.java
 * Servlet para obter dados da sessão via AJAX
 * 
 * ENDPOINT:
 * GET /Session → Retorna dados do usuário logado em JSON
 * 
 * RESPOSTA:
 * {
 *   "logado": true,
 *   "usuario": {
 *     "id": 1,
 *     "nome": "João Silva",
 *     "username": "joao",
 *     "email": "joao@email.com"
 *   },
 *   "loja": {
 *     "id": 1,
 *     "nome": "Ótica Centro"
 *   },
 *   "perfil": {
 *     "id": 3,
 *     "nome": "Caixa"
 *   }
 * }
 * 
 * Se não logado:
 * {
 *   "logado": false,
 *   "error": "Sessão não encontrada"
 * }
 * 
 * @author OptoFreela
 */
public class SessionServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        // Adiciona headers para evitar cache
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");
        
        JsonObject resultado = new JsonObject();
        
        try {
            HttpSession session = request.getSession(false);
            
            if (session == null) {
                resultado.addProperty("logado", false);
                resultado.addProperty("error", "Sessão não encontrada");
                enviarResposta(response, resultado);
                return;
            }
            
            Usuario usuario = (Usuario) session.getAttribute("usuario");
            
            if (usuario == null) {
                resultado.addProperty("logado", false);
                resultado.addProperty("error", "Usuário não encontrado na sessão");
                enviarResposta(response, resultado);
                return;
            }
            
            // ✅ Usuário logado - monta resposta completa
            resultado.addProperty("logado", true);
            
            // Dados do usuário
            JsonObject usuarioJson = new JsonObject();
            usuarioJson.addProperty("id", usuario.getId());
            usuarioJson.addProperty("nome", usuario.getNome());
            usuarioJson.addProperty("username", usuario.getUsername());
            usuarioJson.addProperty("email", usuario.getEmail() != null ? usuario.getEmail() : "");
            resultado.add("usuario", usuarioJson);
            
            // Dados da loja
            if (usuario.getOtica() != null) {
                JsonObject lojaJson = new JsonObject();
                lojaJson.addProperty("id", usuario.getOtica().getIdOtica());
                lojaJson.addProperty("nome", usuario.getOtica().getNomeOtica());
                lojaJson.addProperty("endereco", usuario.getOtica().getEnderecoOtica());
                lojaJson.addProperty("cidade", usuario.getOtica().getCidadeOtica());
                lojaJson.addProperty("estado", usuario.getOtica().getEstadoOtica());
                lojaJson.addProperty("telefone", usuario.getOtica().getTelefoneOtica());
                resultado.add("loja", lojaJson);
            } else {
                resultado.add("loja", null);
            }
            
            // Dados do perfil
            if (usuario.getPerfil() != null) {
                JsonObject perfilJson = new JsonObject();
                perfilJson.addProperty("id", usuario.getPerfil().getId());
                perfilJson.addProperty("nome", usuario.getPerfil().getNome());
                resultado.add("perfil", perfilJson);
            } else {
                resultado.add("perfil", null);
            }
            
            // Metadados da sessão
            JsonObject sessaoJson = new JsonObject();
            sessaoJson.addProperty("id", session.getId());
            sessaoJson.addProperty("criadaEm", session.getCreationTime());
            sessaoJson.addProperty("ultimoAcesso", session.getLastAccessedTime());
            sessaoJson.addProperty("tempoMaximoInativo", session.getMaxInactiveInterval());
            resultado.add("sessao", sessaoJson);
            
            enviarResposta(response, resultado);
            
        } catch (Exception e) {
            System.err.println("❌ Erro no SessionServlet: " + e.getMessage());
            e.printStackTrace();
            
            resultado.addProperty("logado", false);
            resultado.addProperty("error", "Erro interno: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            enviarResposta(response, resultado);
        }
    }
    
    /**
     * Envia resposta JSON
     */
    private void enviarResposta(HttpServletResponse response, JsonObject json) throws IOException {
        PrintWriter out = response.getWriter();
        out.print(gson.toJson(json));
        out.flush();
    }
}
