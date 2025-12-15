package br.com.vendas.servlet;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * LogoutServlet.java
 * Servlet para encerrar sessão do usuário
 * 
 * ENDPOINT:
 * GET /Logout
 * POST /Logout
 * 
 * REDIRECIONA:
 * - login.html
 * 
 * @author OptoFreela
 */
public class LogoutServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    public LogoutServlet() {
        super();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        realizarLogout(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        realizarLogout(request, response);
    }

    private void realizarLogout(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        
        HttpSession session = request.getSession(false);
        
        if (session != null) {
            String usuarioNome = (String) session.getAttribute("usuarioNome");
            
            System.out.println("");
            System.out.println("╔════════════════════════════════════════════════════════════════╗");
            System.out.println("║  🚪 LOGOUT                                                     ║");
            System.out.println("╚════════════════════════════════════════════════════════════════╝");
            System.out.println("Usuário: " + (usuarioNome != null ? usuarioNome : "Desconhecido"));
            System.out.println("═══════════════════════════════════════════════════════════════════");
            
            // Invalida a sessão
            session.invalidate();
        }
        
        // Redireciona para login
        response.sendRedirect("login.html");
    }
}
