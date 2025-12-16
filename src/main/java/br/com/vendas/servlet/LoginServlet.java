package br.com.vendas.servlet;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import br.com.vendas.beans.Otica;
import br.com.vendas.beans.Perfil;
import br.com.vendas.beans.Usuario;
import br.com.vendas.dao.ConnectionFactory;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * LoginServlet.java
 * Servlet para autenticação de usuários
 * 
 * REDIRECIONAMENTO POR PERFIL:
 * - Caixa     → caixa.html
 * - Vendedor  → index.html
 * - Admin     → index.html
 * - Outros    → index.html
 */
public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    public LoginServlet() {
        super();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        String username = request.getParameter("username");
        String senha = request.getParameter("senha");
        
        System.out.println("");
        System.out.println("╔════════════════════════════════════════════════════════════════╗");
        System.out.println("║  🔐 LOGIN SERVLET - doPost()                                   ║");
        System.out.println("╠════════════════════════════════════════════════════════════════╣");
        System.out.println("║  Username: [" + username + "]");
        System.out.println("║  Senha: [" + (senha != null ? "***" : "NULL") + "]");
        System.out.println("╚════════════════════════════════════════════════════════════════╝");
        
        // Validação básica
        if (username == null || username.trim().isEmpty() || 
            senha == null || senha.trim().isEmpty()) {
            System.out.println("❌ Campos obrigatórios não preenchidos");
            response.sendRedirect("login.html?error=invalid");
            return;
        }
        
        Connection conn = null;
        
        try {
            System.out.println("📡 Obtendo conexão...");
            conn = ConnectionFactory.getInstance().getConnection();
            System.out.println("✅ Conexão obtida");
            
            // Busca usuário
            System.out.println("🔍 Buscando usuário: " + username.trim());
            Usuario usuario = autenticar(conn, username.trim(), senha.trim());
            
            if (usuario == null) {
                System.out.println("❌ Usuário ou senha inválidos - autenticar() retornou null");
                response.sendRedirect("login.html?error=invalid");
                return;
            }
            
            System.out.println("✅ Usuário encontrado: " + usuario.getNome());
            
            // Cria sessão
            HttpSession session = request.getSession(true);
            session.setAttribute("usuario", usuario);
            session.setAttribute("usuarioId", usuario.getId());
            session.setAttribute("usuarioNome", usuario.getNome());
            session.setAttribute("usuarioUsername", usuario.getUsername());
            
            System.out.println("🔑 Sessão criada - ID: " + session.getId());
            
            if (usuario.getOtica() != null) {
                session.setAttribute("lojaId", usuario.getOtica().getIdOtica());
                session.setAttribute("lojaNome", usuario.getOtica().getNomeOtica());
                System.out.println("🏪 Loja: " + usuario.getOtica().getNomeOtica());
            } else {
                System.out.println("⚠️ Usuário sem loja");
            }
            
            // ✅ NOVO - Guarda perfil na sessão
            String perfilNome = null;
            if (usuario.getPerfil() != null) {
                session.setAttribute("perfilId", usuario.getPerfil().getId());
                session.setAttribute("perfilNome", usuario.getPerfil().getNome());
                perfilNome = usuario.getPerfil().getNome();
                System.out.println("👤 Perfil: " + perfilNome);
            } else {
                System.out.println("⚠️ Usuário sem perfil");
            }
            
            // Tempo de sessão: 8 horas
            session.setMaxInactiveInterval(8 * 60 * 60);
            
            // ✅ NOVO - Determina página de destino baseado no perfil
            String paginaDestino = determinarPaginaDestino(perfilNome);
            
            System.out.println("");
            System.out.println("╔════════════════════════════════════════════════════════════════╗");
            System.out.println("║  ✅ LOGIN REALIZADO COM SUCESSO!                               ║");
            System.out.println("╠════════════════════════════════════════════════════════════════╣");
            System.out.println("║  Usuário: " + usuario.getNome());
            System.out.println("║  Perfil: " + (perfilNome != null ? perfilNome : "Não definido"));
            System.out.println("║  Sessão ID: " + session.getId());
            System.out.println("║  Redirecionando para: " + paginaDestino);
            System.out.println("╚════════════════════════════════════════════════════════════════╝");
            
            response.sendRedirect(paginaDestino);
            
        } catch (Exception e) {
            System.err.println("❌ ERRO NO LOGIN: " + e.getMessage());
            e.printStackTrace();
            response.sendRedirect("login.html?error=system");
            
        } finally {
            if (conn != null) {
                try {
                    conn.close();
                    System.out.println("📡 Conexão fechada");
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    /**
     * ✅ NOVO - Determina página de destino baseado no perfil do usuário
     * 
     * @param perfilNome Nome do perfil do usuário
     * @return URL da página de destino
     */
    private String determinarPaginaDestino(String perfilNome) {
        if (perfilNome == null || perfilNome.isEmpty()) {
            return "index.html"; // Padrão
        }
        
        // Normaliza o nome do perfil para comparação
        String perfilLower = perfilNome.toLowerCase().trim();
        
        switch (perfilLower) {
            case "caixa":
            case "operador de caixa":
            case "operador_caixa":
                return "caixa.html";
                
            case "vendedor":
            case "vendedora":
            case "atendente":
                return "index.html";
                
            case "admin":
            case "administrador":
            case "gerente":
                return "index.html"; // Admins usam o sistema completo
                
            default:
                return "index.html";
        }
    }

    /**
     * Autentica usuário no banco de dados
     */
    private Usuario autenticar(Connection conn, String username, String senha) throws SQLException {
        System.out.println("┌─────────────────────────────────────────────────────────────────");
        System.out.println("│ 🔐 autenticar() - Executando query                             │");
        System.out.println("│ Username: " + username);
        System.out.println("│ Senha: ***");
        
        // LOWER() para busca case-insensitive
        String sql = "SELECT u.id, u.nome, u.username, u.email, u.id_loja, u.id_perfil, " +
                     "l.nome as loja_nome, l.endereco as loja_endereco, l.cidade as loja_cidade, " +
                     "l.estado as loja_estado, l.telefone as loja_telefone, " +
                     "p.nome as perfil_nome " +
                     "FROM usuario u " +
                     "LEFT JOIN loja l ON u.id_loja = l.id " +
                     "LEFT JOIN perfil p ON u.id_perfil = p.id " +
                     "WHERE LOWER(u.username) = LOWER(?) AND u.senha = ?";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, username);
            stmt.setString(2, senha);
            
            System.out.println("│ Executando query...");
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    System.out.println("│ ✅ Registro encontrado!");
                    
                    Usuario usuario = new Usuario();
                    usuario.setId(rs.getInt("id"));
                    usuario.setNome(rs.getString("nome"));
                    usuario.setUsername(rs.getString("username"));
                    usuario.setEmail(rs.getString("email"));
                    
                    System.out.println("│ ID: " + usuario.getId());
                    System.out.println("│ Nome: " + usuario.getNome());
                    
                    // Loja/Ótica
                    int idLoja = rs.getInt("id_loja");
                    System.out.println("│ id_loja: " + idLoja);
                    
                    if (idLoja > 0) {
                        Otica otica = new Otica();
                        otica.setIdOtica(idLoja);
                        otica.setNomeOtica(rs.getString("loja_nome"));
                        otica.setEnderecoOtica(rs.getString("loja_endereco"));
                        otica.setCidadeOtica(rs.getString("loja_cidade"));
                        otica.setEstadoOtica(rs.getString("loja_estado"));
                        otica.setTelefoneOtica(rs.getString("loja_telefone"));
                        usuario.setOtica(otica);
                        System.out.println("│ Loja: " + otica.getNomeOtica());
                    }
                    
                    // Perfil
                    int idPerfil = rs.getInt("id_perfil");
                    System.out.println("│ id_perfil: " + idPerfil);
                    
                    if (idPerfil > 0) {
                        Perfil perfil = new Perfil();
                        perfil.setId(idPerfil);
                        perfil.setNome(rs.getString("perfil_nome"));
                        usuario.setPerfil(perfil);
                        System.out.println("│ Perfil: " + perfil.getNome());
                    }
                    
                    System.out.println("│ ✅ Usuario criado com sucesso");
                    System.out.println("└─────────────────────────────────────────────────────────────────");
                    return usuario;
                } else {
                    System.out.println("│ ❌ Nenhum registro encontrado");
                    System.out.println("└─────────────────────────────────────────────────────────────────");
                }
            }
        } catch (SQLException e) {
            System.err.println("│ ❌ ERRO SQL: " + e.getMessage());
            System.out.println("└─────────────────────────────────────────────────────────────────");
            throw e;
        }
        
        return null;
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.sendRedirect("login.html");
    }
}
