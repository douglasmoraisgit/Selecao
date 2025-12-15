package br.com.vendas.beans;

/**
 * Classe para produtos genéricos que não são Lentes nem Armações
 * (Acessórios, soluções, estojo, flanela, etc.)
 * 
 * @author OptoFreela
 */
public class ProdutoGenerico extends Produto {

    private String categoria;
    private Integer estoque;

    // Construtor padrão
    public ProdutoGenerico() {
        setTipo("Produto");
    }

    // Construtor com parâmetros básicos
    public ProdutoGenerico(Long id, String descricao) {
        super(id, descricao, "Produto");
    }

    // Construtor completo
    public ProdutoGenerico(Long id, String codProdFornecedor, String descricao, String ean, String ncm) {
        super(id, descricao, ean, "Produto", ncm, codProdFornecedor);
    }

    // Getters e Setters
    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public Integer getEstoque() {
        return estoque;
    }

    public void setEstoque(Integer estoque) {
        this.estoque = estoque;
    }

    @Override
    public void imprimirDetalhes() {
        System.out.println("Produto: " + getDescricao() + " - Marca: " + getMarca());
    }

    @Override
    public double getIncremento() {
        return 1; // Produtos genéricos incrementam de 1 em 1
    }
}
