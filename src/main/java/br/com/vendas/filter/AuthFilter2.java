package br.com.vendas.filter;

import java.io.IOException;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * AuthFilter.java
 * Filtro para verificar se o usuário está autenticado
 * 
 * Protege todas as páginas exceto:
 * - login.html
 * - Login (servlet)
 * - Logout (servlet)
 * - Recursos estáticos (css, js, images, fonts)
 * 
 * @author OptoFreela
 */
public class AuthFilter2 implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        System.out.println("✅ AuthFilter inicializado");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String uri = httpRequest.getRequestURI();
        String contextPath = httpRequest.getContextPath();
        String path = uri.substring(contextPath.length());
        
        // 🔍 DEBUG: Log de toda requisição
        System.out.println("");
        System.out.println("┌─────────────────────────────────────────────────────────────────┐");
        System.out.println("│ 🔍 AuthFilter - REQUISIÇÃO INTERCEPTADA                        │");
        System.out.println("├─────────────────────────────────────────────────────────────────┤");
        System.out.println("│ URI completa: " + uri);
        System.out.println("│ Context Path: " + contextPath);
        System.out.println("│ Path extraído: " + path);
        System.out.println("│ Método: " + httpRequest.getMethod());
        
        // Recursos que não precisam de autenticação
        boolean isPublic = isPublicResource(path);
        System.out.println("│ É recurso público? " + isPublic);
        
        if (isPublic) {
            System.out.println("│ ✅ LIBERADO - Recurso público");
            System.out.println("└─────────────────────────────────────────────────────────────────┘");
            chain.doFilter(request, response);
            return;
        }
        
        // Verifica sessão
        HttpSession session = httpRequest.getSession(false);
        boolean isLoggedIn = (session != null && session.getAttribute("usuario") != null);
        
        System.out.println("│ Sessão existe? " + (session != null));
        System.out.println("│ Usuário na sessão? " + isLoggedIn);
        
        if (isLoggedIn) {
            System.out.println("│ ✅ LIBERADO - Usuário autenticado");
            System.out.println("└─────────────────────────────────────────────────────────────────┘");
            chain.doFilter(request, response);
        } else {
            System.out.println("│ ❌ BLOQUEADO - Redirecionando para login");
            System.out.println("└─────────────────────────────────────────────────────────────────┘");
            httpResponse.sendRedirect(contextPath + "/login.html?error=session");
        }
    }

    /**
     * Verifica se é um recurso público (não precisa de autenticação)
     */
    private boolean isPublicResource(String path) {
        // Página de login
        if (path.equals("/login.html") || path.equals("/login.jsp")) {
            return true;
        }
        
        // Servlets de login/logout (aceita ambas URLs)
        if (path.equals("/LoginServlet") || path.equals("/Login") ||
            path.equals("/LogoutServlet") || path.equals("/Logout")) {
            return true;
        }
        
        // Recursos estáticos
        if (path.startsWith("/css/") || 
            path.startsWith("/js/") || 
            path.startsWith("/images/") || 
            path.startsWith("/fonts/") ||
            path.startsWith("/assets/") ||
            path.startsWith("/static/")) {
            return true;
        }
        
        // Arquivos estáticos por extensão
        if (path.endsWith(".css") || 
            path.endsWith(".js") || 
            path.endsWith(".png") || 
            path.endsWith(".jpg") || 
            path.endsWith(".jpeg") || 
            path.endsWith(".gif") || 
            path.endsWith(".ico") || 
            path.endsWith(".svg") ||
            path.endsWith(".woff") ||
            path.endsWith(".woff2") ||
            path.endsWith(".ttf") ||
            path.endsWith(".eot")) {
            return true;
        }
        
        // Raiz vazia (redireciona para index)
        if (path.equals("/") || path.isEmpty()) {
            return false; // Precisa de autenticação
        }
        
        return false;
    }

    @Override
    public void destroy() {
        System.out.println("AuthFilter destruído");
    }
}
