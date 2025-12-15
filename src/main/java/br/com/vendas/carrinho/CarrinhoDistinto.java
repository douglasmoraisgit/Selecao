package br.com.vendas.carrinho;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import br.com.vendas.beans.Lente;
import br.com.vendas.beans.LenteComTratamento;
import br.com.vendas.beans.Produto;

public class CarrinhoDistinto {
    private Map<Long, Item> itens; // Chave pode ser o ID do produto ou a chave da lente com tratamento

    public CarrinhoDistinto() {
        itens = new HashMap<>();
    }

    public void adicionarOuAtualizarItem(Produto produto, double quantidade) {
        Long chave;
        Long idProduto = produto.getId(); // Obtenha o ID do produto

        // Se for um produto do tipo LenteComTratamento, use a chave
        if (produto instanceof LenteComTratamento) {
            chave = ((LenteComTratamento) produto).getChave();
        } else {
            chave = idProduto; // Caso contrário, use o ID do produto
        }
        System.out.println("Chave usada para o produto: " + chave);

        Item item = itens.get(chave);

        // Verifica se o item já existe no carrinho
        if (item == null) {
            // Cria um novo item, agora com o ID, produto e quantidade
            item = new Item(idProduto, produto, quantidade);
            itens.put(chave, item);
        } else {
            // Se já existe, incrementa a quantidade
            item.incrementarQuantidade(quantidade);
        }
    }

    public void atualizarQuantidade(long chave, double quantidade) {
        Item item = itens.get(chave);
        if (item != null) {
            item.setQuantidade(quantidade);
            if (quantidade == 0) {
                itens.remove(chave);
            }
        }
    }
    
    public void atualizarPrecoEQuantidade(Long chave, double preco, double quantidade) {
        Item item = itens.get(chave);
        if (item != null) {
            item.setQuantidade(quantidade);
            item.setPrecoVenda(preco);
            if (quantidade == 0) {
                itens.remove(chave);
            }
        }
    }
    
    public void atualizarPreco(Long chave, double preco) {
        Item item = itens.get(chave);
        if (item != null) {
            item.setPrecoVenda(preco); 
            System.out.println("Metodo atualizarPreço em CarrinhoDistinto " + item.getPrecoVenda());
        }
    }  
    
    // Remove um item do carrinho
    public void removerItem(long chave) {
        itens.remove(chave);
    }

    // Retorna um item específico do carrinho
    public Item getItem(long chave) {
        return itens.get(chave);
    }

    // Retorna todos os itens do carrinho
    public Map<Long, Item> getItens() {
        return itens;
    }

    public void exibirCarrinho() {
        Map<String, Item> produtosExibidos = new HashMap<>();

        // Variáveis para cálculo do total
        int totalProdutosDiferentes = 0;
        double valorTotalCarrinho = 0.0;
        double totalItens = 0;

        // Preenche o mapa com produtos únicos e calcula os totais
        for (Item item : itens.values()) {
            Produto produto = item.getProduto();
            String codigoProduto = produto instanceof Lente ? ((Lente) produto).getCodProdFornecedor() : String.valueOf(produto.getId());

            // Verifica se o produto já foi exibido
            if (!produtosExibidos.containsKey(codigoProduto)) {
                produtosExibidos.put(codigoProduto, item);
                totalProdutosDiferentes++;
            }

            // Calcula o valor total e o número de itens
            valorTotalCarrinho += produto.getPrecoVenda() * item.getQuantidade();
            totalItens += item.getQuantidade();
        }

        // Ordena os produtos pelo campo descrição
        List<Item> itensOrdenados = new ArrayList<>(produtosExibidos.values());
        
        itensOrdenados.sort(Comparator.comparing(item -> item.getProduto().getDescricao()));

        // Exibe os itens únicos ordenados
        for (Item item : itensOrdenados) {
            Produto produto = item.getProduto();
            System.out.println("Fabricante:          " + produto.getFabricante());
            System.out.println("Marca:          " + produto.getMarca());
            System.out.println("Descrição:      " + produto.getDescricao());
            System.out.println("Quantidade:     " + item.getQuantidade());
            System.out.println("Unidade:        " + item.getUnidade());
            System.out.println("Preço Unitário: " + produto.getPrecoVenda());
            System.out.println("Subtotal: " + (produto.getPrecoVenda() * item.getQuantidade()));
            if (produto instanceof LenteComTratamento) {
                LenteComTratamento lenteComTratamento = (LenteComTratamento) produto;
                System.out.println("Tratamentos: " + lenteComTratamento.getTratamentos());
            }
            System.out.println("-----");
        }

        // Exibe as informações totais do carrinho
        System.out.println("Quantidade de Produtos Diferentes: " + totalProdutosDiferentes);
        System.out.println("Total de Itens: " + totalItens);
        System.out.println("Valor Total do Carrinho: " + valorTotalCarrinho);
    }
    
    /**
     * MÉTODO CORRIGIDO: Retorna itens ordenados por marca com tratamento de valores nulos
     * CORREÇÃO: Adicionado Comparator.nullsLast() para evitar NullPointerException
     * PROBLEMA: Lentes de contato com marca null causavam erro fatal
     */
    public List<Item> getItensOrdenados() {
        try {
            return itens.values().stream()
                    .sorted(Comparator.comparing(
                        item -> {
                            // Validação robusta contra nulos
                            if (item == null || item.getProduto() == null) {
                                return "";
                            }
                            String marca = item.getProduto().getMarca();
                            // Retorna string vazia se marca for null
                            return marca != null ? marca : "";
                        },
                        Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)
                    ))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            // Log do erro e retorna lista sem ordenação como fallback
            System.err.println("ERRO ao ordenar itens do carrinho: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>(itens.values());
        }
    }

    // Exemplo de como você pode exibir os itens ordenados
    public void exibirItensOrdenados() {
        List<Item> itensOrdenados = getItensOrdenados();

        for (Item item : itensOrdenados) {
            Produto produto = item.getProduto();
            System.out.println("Marca: " + (produto.getMarca() != null ? produto.getMarca() : "Sem Marca"));
            System.out.println("Descrição: " + produto.getDescricao());
            System.out.println("Quantidade: " + item.getQuantidade());
            System.out.println("Preço Unitário: " + produto.getPrecoVenda());
            System.out.println("Subtotal: " + (produto.getPrecoVenda() * item.getQuantidade()));
            if (produto instanceof LenteComTratamento) {
                LenteComTratamento lenteComTratamento = (LenteComTratamento) produto;
                System.out.println("Tratamentos: " + lenteComTratamento.getTratamentos());
            }
            System.out.println("-----");
        }
    }
    
    // Método para calcular o total do carrinho
    public double calcularTotal() {
        double totalCarrinho = 0.0;

        // Percorre todos os itens do carrinho
        for (Item item : itens.values()) {
            Produto produto = item.getProduto();
            totalCarrinho += produto.getPrecoVenda() * item.getQuantidade();
        }

        return totalCarrinho;
    }

    // Método para exibir o carrinho com o total calculado
    public void exibirCarrinhoComTotal() {
        exibirCarrinho(); // Exibe os itens do carrinho

        // Exibe o valor total calculado
        double total = calcularTotal();
        System.out.println("Total do Carrinho: " + total);
    }
    
    public void limparCarrinho() {
        itens.clear(); // Remove todos os itens do carrinho
        System.out.println("Carrinho limpo com sucesso.");
    }
    
    /**
     * MÉTODO ADICIONAL: Corrige itens com marca null no carrinho
     * Útil para executar antes de chamar getItensOrdenados() se houver dúvidas
     */
    public void corrigirMarcasNulas() {
        if (itens == null || itens.isEmpty()) {
            return;
        }
        
        itens.values().stream()
            .filter(item -> item != null && item.getProduto() != null)
            .filter(item -> item.getProduto().getMarca() == null)
            .forEach(item -> {
                item.getProduto().setMarca("Sem Marca");
                System.out.println("⚠️ AVISO: Marca corrigida para produto: " + 
                    item.getProduto().getDescricao());
            });
    }
    
    /**
     * MÉTODO ADICIONAL: Valida integridade dos itens no carrinho
     * Retorna true se todos os itens estão válidos
     */
    public boolean validarIntegridadeCarrinho() {
        if (itens == null || itens.isEmpty()) {
            return true;
        }
        
        long itensInvalidos = itens.values().stream()
            .filter(item -> item == null || 
                           item.getProduto() == null || 
                           item.getProduto().getMarca() == null ||
                           item.getProduto().getDescricao() == null)
            .count();
        
        if (itensInvalidos > 0) {
            System.err.println("⚠️ AVISO: " + itensInvalidos + 
                " item(ns) com dados incompletos no carrinho");
            return false;
        }
        
        return true;
    }
}
