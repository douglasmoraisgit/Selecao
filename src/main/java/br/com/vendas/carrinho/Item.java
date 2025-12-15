package br.com.vendas.carrinho;

import br.com.vendas.beans.Produto;

public class Item {
    private Long id;
    private String codigoWeb;
    private Produto produto;
    private String descricao;
    private String tipo;
    private double quantidade;
    private double precoVenda;
    private String unidade;

    // Construtor completo com codigoWeb
    public Item(Long id, Produto produto, double quantidade, double precoVenda, String unidade, String codigoWeb) {
        this.id = id;
        this.produto = produto;
        this.quantidade = quantidade;
        this.precoVenda = precoVenda;
        this.unidade = unidade;
        this.codigoWeb = codigoWeb;
        this.descricao = produto.getDescricao();
    }

    // Construtor parcial com produto, quantidade e codigoWeb
    public Item(Produto produto, double quantidade, String codigoWeb) {
        this.produto = produto;
        this.id = produto.getId();
        this.quantidade = quantidade;
        this.precoVenda = produto.getPrecoVenda();
        this.unidade = produto.getUnidade();
        this.codigoWeb = codigoWeb;
        this.descricao = produto.getDescricao();
    }
    // 🔥 Construtor com o ID
    public Item(Long id, Produto produto, double quantidade) {
        this.id = id; // Agora o ID é inicializado corretamente
        this.produto = produto;
        this.quantidade = quantidade;
        this.precoVenda = produto.getPrecoVenda(); // Agora o preço é inicializado corretamente
        //  this.unidade = produto.getUnidade();
    }
    public Item(Long id, Produto produto, double quantidade,double precoVenda,String unidade) {
        this.id = id; // Agora o ID é inicializado corretamente
        this.produto = produto;
        this.quantidade = quantidade;
        this.precoVenda = produto.getPrecoVenda(); // Agora o preço é inicializado corretamente
        this.unidade = produto.getUnidade(); // Supondo que a unidade seja relevante
    }

    public Item(Produto produto,double qtd) {
    	this.produto = produto;
    	this.id = produto.getId(); // Agora o ID é inicializado corretamente
        this.descricao = produto.getDescricao();
    	this.quantidade = qtd;
        this.precoVenda = produto.getPrecoVenda(); // Agora o preço é inicializado corretamente
        this.unidade = produto.getUnidade(); // Supondo que a unidade seja relevante
    }

    // Construtor padrão
    public Item() {}
    
	public Produto getProduto() {
        return produto;
    }

    public void setProduto(Produto produto) {
        this.produto = produto;
    }

    public double getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(double quantidade) {
        this.quantidade = quantidade;
    }

    public double getPrecoVenda() {
		return precoVenda;
	}

	public void setPrecoVenda(double precoVenda) {
		this.precoVenda = precoVenda;
	}

	public String getUnidade() {
		return unidade;
	}

	public void setUnidade(String unidade) {
		this.unidade = unidade;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}


	public String getCodigoWeb() {
		return codigoWeb;
	}
	public void setCodigoWeb(String codigoWeb) {
		this.codigoWeb = codigoWeb;
	}
	public void incrementarQuantidade(double quantidade) {
        this.quantidade += quantidade;
    }
	 public String getDescricao() {
			return descricao;
		}
		public void setDescricao(String descricao) {
			this.descricao = descricao;
		}
	
	
	
	public String getTipo() {
			return tipo;
		}
		public void setTipo(String tipo) {
			this.tipo = tipo;
		}
	@Override
	public String toString() {
	    return "Item{id=" + id + ", produto=" + produto.getDescricao() + ", quantidade=" + quantidade + ", precoVenda=" + precoVenda + ", unidade=" + unidade + "}";
	}

}

