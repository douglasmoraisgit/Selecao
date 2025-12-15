package br.com.vendas.servlet;

import java.io.IOException;
import java.io.PrintWriter;

import com.google.gson.Gson;

import br.com.vendas.beans.ProdutoGenerico;
import br.com.vendas.carrinho.CarrinhoDistinto;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

public class AdicionarCarrinhoProduto extends HttpServlet {
    private static final long serialVersionUID = 1L;

    public AdicionarCarrinhoProduto() {
        super();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
        
        HttpSession session = request.getSession();
        CarrinhoDistinto carrinho = (CarrinhoDistinto) session.getAttribute("carrinho");
        
        if (carrinho == null) {
            carrinho = new CarrinhoDistinto();
        }
        
        try {
            // Parâmetros do produto
            String codigoParam = request.getParameter("codigo");
            String quantidadeParam = request.getParameter("quantidade");
            String precoParam = request.getParameter("preco");
            String descricao = request.getParameter("descricao");
            String marca = request.getParameter("marca");
            String unidade = request.getParameter("unidade");
            String tipo = request.getParameter("tipo");
            
            // Validações básicas
            if (codigoParam == null || codigoParam.isEmpty()) {
                enviarErro(response, "Código do produto é obrigatório");
                return;
            }
            
            int codigo = Integer.parseInt(codigoParam);
            double quantidade = quantidadeParam != null ? Double.parseDouble(quantidadeParam) : 1.0;
            double preco = precoParam != null ? Double.parseDouble(precoParam) : 0.0;
            
            // Cria o produto
            ProdutoGenerico produto = new ProdutoGenerico();
            produto.setId((long) codigo);
            produto.setCodProdFornecedor(String.valueOf(codigo));
            produto.setDescricao(descricao != null ? descricao : "Produto " + codigo);
            produto.setMarca(marca != null ? marca : "");
            produto.setUnidade(unidade != null ? unidade : "un");
            produto.setPrecoVenda(preco);
            produto.setPrecoMinimo(preco * 0.8); // 80% como preço mínimo padrão
            produto.setTipo(tipo != null ? tipo : "Produto");
            produto.setChave((long) codigo);
            
            // Adiciona ao carrinho
            carrinho.adicionarOuAtualizarItem(produto, quantidade);
            
            // Salva na sessão
            session.setAttribute("carrinho", carrinho);
            
            // Log
            System.out.println("✅ Produto adicionado ao carrinho: " + produto.getDescricao() + " (Qtd: " + quantidade + ")");
            
            // Resposta JSON de sucesso
            RespostaCarrinho resp = new RespostaCarrinho();
            resp.sucesso = true;
            resp.mensagem = "Produto adicionado ao carrinho";
            resp.codigo = codigo;
            resp.quantidade = quantidade;
            
            Gson gson = new Gson();
            PrintWriter out = response.getWriter();
            out.print(gson.toJson(resp));
            out.flush();
            
        } catch (NumberFormatException e) {
            System.err.println("Erro ao converter parâmetros: " + e.getMessage());
            enviarErro(response, "Parâmetros inválidos");
        } catch (Exception e) {
            System.err.println("Erro ao adicionar produto: " + e.getMessage());
            e.printStackTrace();
            enviarErro(response, "Erro ao adicionar produto ao carrinho");
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        doPost(request, response);
    }
    
    private void enviarErro(HttpServletResponse response, String mensagem) throws IOException {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        
        RespostaCarrinho resp = new RespostaCarrinho();
        resp.sucesso = false;
        resp.mensagem = mensagem;
        
        Gson gson = new Gson();
        PrintWriter out = response.getWriter();
        out.print(gson.toJson(resp));
        out.flush();
    }
    
    /**
     * Classe para resposta JSON
     */
    private static class RespostaCarrinho {
        boolean sucesso;
        String mensagem;
        int codigo;
        double quantidade;
    }
}
