package br.com.vendas.beans;



public abstract class Produto {
	
	private Long id;
	private Long chave;
	
	private String marca;
    private String fabricante;
    private String descricao;
    private String unidade;
    private String modelo;
    private String tipo;
    private double precoCusto;
    private double precoVenda;
    private double precoMinimo;
    private double precoPar;
    private String ean;
    private String ncm;
    private String codProdFornecedor;
    
 // Construtor vazio
    public Produto() {}
  
    public Produto(Long id, String descricao, String tipo) {
        this.id = id;
        this.descricao = descricao;
        this.tipo = tipo;
        
    }

	

    // Construtor com atributos comuns
    public Produto(Long id, String descricao,String tipo, String fabricante) {
        this.id = id;
        this.descricao = descricao;
        this.tipo = tipo;
        this.fabricante = fabricante;
    }
    public Produto(Long id, String descricao, String ean, String tipo, String ncm, String codProdFornecedor) {
        this.id = id;
        this.descricao = descricao;
        this.ean = ean;
        this.tipo = tipo;
        this.ncm = ncm;
        this.codProdFornecedor = codProdFornecedor;
    }
    
    public Long getChave() {
  		return chave;
  	}

  	public void setChave(Long chave) {
  		this.chave = chave;
  	}
    
    
    public String getTipo() {
		return tipo;
	}

	public void setTipo(String tipo) {
		this.tipo = tipo;
	}

	public String getModelo() {
		return modelo;
	}

	public void setModelo(String modelo) {
		this.modelo = modelo;
	}


    public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getMarca() {
		return marca;
	}

	public void setMarca(String marca) {
		this.marca = marca;
	}

	public String getFabricante() {
		return fabricante;
	}

	public void setFabricante(String fabricante) {
		this.fabricante = fabricante;
	}

	public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
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

	public double getPrecoCusto() {
		return precoCusto;
	}

	public void setPrecoCusto(double precoCusto) {
		this.precoCusto = precoCusto;
	}

	public double getPrecoMinimo() {
		return precoMinimo;
	}

	public void setPrecoMinimo(double precoMinimo) {
		this.precoMinimo = precoMinimo;
	}

	public double getPrecoPar() {
		return precoPar;
	}

	public void setPrecoPar(double precoPar) {
		this.precoPar = precoPar;
	}

	public String getEan() {
		return ean;
	}

	public void setEan(String ean) {
		this.ean = ean;
	}

	public String getNcm() {
		return ncm;
	}

	public void setNcm(String ncm) {
		this.ncm = ncm;
	}

	public String getCodProdFornecedor() {
		return codProdFornecedor;
	}

	public void setCodProdFornecedor(String codProdFornecedor) {
		this.codProdFornecedor = codProdFornecedor;
	}

	// Método abstrato para ser implementado por subclasses
    public abstract void imprimirDetalhes();
    
    // Método abstrato para definir a forma de incrementar a quantidade
    public abstract double getIncremento();
}
