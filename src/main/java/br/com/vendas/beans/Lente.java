package br.com.vendas.beans;



public class Lente extends Produto {
	
    private int idLente;
    private long chave;
    private String codProdFornecedor;
    private String codigoWeb;
    private String marca;
    private String descricao;
    private double esferico;
    private double cilindrico;
    private String fabricante;
    private String diametro;
    private double ir;
    private String familia;
    private String antireflexo;
    private String arResidual;
    private String antiblue;
    private String fotossensivel;
    private String corFoto;

    private String modelo;
  //  private List<Tratamento> tratamentos;  // Adicionando a lista de tratamentos
    private String Tratamento;
    private String tipo;
    private String material;
    private String cor;
    private double adicao;
    private int alturaMinima;
    private String afinamento;
    private String tecnicaProducao;
    private double precoCusto;
    private double precoVenda;
    private double precoMinimo;
    private double precoPar;
    private String unidade;
    private double margem;
    private String distancia;
    private String lado;
    private String visao;
    private Double EsfIni;
    private Double EsfFim;
    private Double CilIni;
    private Double CilFim;
    private Double AdiIni;
    private Double AdiFim;
    private Integer eixo;         // eixo prescrito
    private Double adicaoReceita; // adição usada na receita (diferente da faixa disponível)
    
    // Construtor padrão
    public Lente() {}

    // Construtor para inicializar os atributos
    public Lente(Long id, String descricao, String fabricante, double esferico, double cilindrico, String marca) {
        super(id, descricao, fabricante);
        this.esferico = esferico;
        this.cilindrico = cilindrico;
        this.marca = marca;
    }

    // ✅ Construtor atualizado para chamar corretamente `Produto`
    public Lente(Long id, String codProdFornecedor,String descricao, String fabricante, String tipo, String ean, double esferico, double cilindrico, String marca) {
        super(id, descricao, tipo, ean);
        this.codProdFornecedor = codProdFornecedor;
        this.fabricante = fabricante;
        this.esferico = esferico;
        this.cilindrico = cilindrico;
        this.marca = marca;
    }
    
    public Lente(Lente outra) {
        super(outra.getId(), outra.getDescricao(), outra.getFabricante()); // se o construtor de Produto tiver isso

        this.idLente = outra.getIdLente();
        this.chave = outra.getChave();
        this.codProdFornecedor = outra.getCodProdFornecedor();
        this.codigoWeb = outra.getCodigoWeb();
        this.marca = outra.getMarca();
        this.descricao = outra.getDescricao();
        this.esferico = outra.getEsferico();
        this.cilindrico = outra.getCilindrico();
        this.fabricante = outra.getFabricante();
        this.diametro = outra.getDiametro();
        this.ir = outra.getIr();
        this.familia = outra.getFamilia();
        this.antireflexo = outra.getAntireflexo();
        this.arResidual = outra.getArResidual();
        this.antiblue = outra.getAntiblue();
        this.fotossensivel = outra.getFotossensivel();
        this.modelo = outra.getModelo();
        this.Tratamento = outra.getTratamento();
        this.tipo = outra.getTipo();
        this.material = outra.getMaterial();
        this.cor = outra.getCor();
        this.adicao = outra.getAdicao();
        this.alturaMinima = outra.getAlturaMinima();
        this.afinamento = outra.getAfinamento();
        this.tecnicaProducao = outra.getTecnicaProducao();
        this.precoCusto = outra.getPrecoCusto();
        this.precoVenda = outra.getPrecoVenda();
        this.precoMinimo = outra.getPrecoMinimo();
        this.precoPar = outra.getPrecoPar();
        this.unidade = outra.getUnidade();
        this.margem = outra.getMargem();
        this.distancia = outra.getDistancia();
        this.lado = outra.getLado();
        this.visao = outra.getVisao();
        this.EsfIni = outra.getEsfIni();
        this.EsfFim = outra.getEsfFim();
        this.CilIni = outra.getCilIni();
        this.CilFim = outra.getCilFim();
        this.AdiIni = outra.getAdiIni();
        this.AdiFim = outra.getAdiFim();
        this.eixo = outra.getEixo();
        this.adicaoReceita = outra.getAdicaoReceita();
    }


    // Getters and setters
    public int getIdLente() {
        return idLente;
    }

    public void setIdLente(int idLente) {
    	this.idLente = idLente;
		
	}

    public Long getChave() {
		return chave;
	}

	public void setChave(long chave) {
		this.chave = chave;
	}

	public String getCodProdFornecedor() {
        return codProdFornecedor;
    }

    public void setCodProdFornecedor(String codProdFornecedor) {
        this.codProdFornecedor = codProdFornecedor;
    }

    public String getCodigoWeb() {
		return codigoWeb;
	}

	public void setCodigoWeb(String codigoWeb) {
		this.codigoWeb = codigoWeb;
	}

	public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public double getEsferico() {
        return esferico;
    }

    public void setEsferico(double esferico) {
        this.esferico = esferico;
    }

    public double getCilindrico() {
        return cilindrico;
    }

    public void setCilindrico(double cilindrico) {
        this.cilindrico = cilindrico;
    }

    public String getFabricante() {
        return fabricante;
    }

    public void setFabricante(String fabricante) {
        this.fabricante = fabricante;
    }

    public String getDiametro() {
        return diametro;
    }

    public void setDiametro(String diametro) {
        this.diametro = diametro;
    }

    public double getIr() {
        return ir;
    }

    public void setIr(double ir) {
        this.ir = ir;
    }

    public String getFamilia() {
        return familia;
    }

    public void setFamilia(String familia) {
        this.familia = familia;
    }

    public String getAntireflexo() {
        return antireflexo;
    }

    public void setAntireflexo(String antireflexo) {
        this.antireflexo = antireflexo;
    }

    public String getArResidual() {
        return arResidual;
    }

    public void setArResidual(String arResidual) {
        this.arResidual = arResidual;
    }

    public String getAntiblue() {
        return antiblue;
    }

    public void setAntiblue(String antiblue) {
        this.antiblue = antiblue;
    }

    public String getFotossensivel() {
        return fotossensivel;
    }

    public void setFotossensivel(String fotossensivel) {
        this.fotossensivel = fotossensivel;
    }

/*    public List<Tratamento> getTratamentos() {
        return tratamentos;
    }

    public void setTratamentos(List<Tratamento> tratamentos) {
        this.tratamentos = tratamentos;
    }
*/
  

    public String getCorFoto() {
		return corFoto;
	}

	public void setCorFoto(String corFoto) {
		this.corFoto = corFoto;
	}

	public String getModelo() {
		return modelo;
	}

	public void setModelo(String modelo) {
		this.modelo = modelo;
	}

	public String getTratamento() {
		return Tratamento;
	}

	public void setTratamento(String tratamento) {
		Tratamento = tratamento;
	}

	public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getMaterial() {
        return material;
    }

    public void setMaterial(String material) {
        this.material = material;
    }

    public String getCor() {
        return cor;
    }

    public void setCor(String cor) {
        this.cor = cor;
    }

    public double getAdicao() {
        return adicao;
    }

    public void setAdicao(double adicao) {
        this.adicao = adicao;
    }

    public int getAlturaMinima() {
        return alturaMinima;
    }

    public void setAlturaMinima(int alturaMinima) {
        this.alturaMinima = alturaMinima;
    }

    public String getAfinamento() {
        return afinamento;
    }

    public void setAfinamento(String afinamento) {
        this.afinamento = afinamento;
    }

    public String getTecnicaProducao() {
        return tecnicaProducao;
    }

    public void setTecnicaProducao(String tecnicaProducao) {
        this.tecnicaProducao = tecnicaProducao;
    }

    public double getPrecoCusto() {
        return precoCusto;
    }

    public void setPrecoCusto(double precoCusto) {
        this.precoCusto = precoCusto;
    }

    public double getPrecoVenda() {
        return precoVenda;
    }

    public void setPrecoVenda(double precoVenda) {
        this.precoVenda = precoVenda;
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

	public String getUnidade() {
		return unidade;
	}

	public void setUnidade(String unidade) {
		this.unidade = unidade;
	}

	public double getMargem() {
		return margem;
	}

	public void setMargem(double margem) {
		this.margem = margem;
	}
	public String getDistancia() {
		return distancia;
	}

	public void setDistancia(String distancia) {
		this.distancia = distancia;
	}

	public String getLado() {
		return lado;
	}

	public void setLado(String lado) {
		this.lado = lado;
	}

	public String getVisao() {
		return visao;
	}

	public void setVisao(String visao) {
		this.visao = visao;
	}

	public Double getEsfIni() {
		return EsfIni;
	}

	public void setEsfIni(Double EsfIni) {
		this.EsfIni = EsfIni;
	}

	public Double getEsfFim() {
		return EsfFim;
	}



	public Double getCilIni() {
		return CilIni;
	}

	public void setCilIni(Double cilIni) {
		CilIni = cilIni;
	}

	public Double getCilFim() {
		return CilFim;
	}

	public void setCilFim(Double cilFim) {
		CilFim = cilFim;
	}

	public Double getAdiIni() {
		return AdiIni;
	}

	public void setAdiIni(Double adiIni) {
		AdiIni = adiIni;
	}

	public Double getAdiFim() {
		return AdiFim;
	}

	public void setAdiFim(Double adiFim) {
		AdiFim = adiFim;
	}

	public void setEsfFim(Double esfFim) {
		EsfFim = esfFim;
	}
	public Integer getEixo() {
	    return eixo;
	}

	public void setEixo(Integer eixo) {
	    this.eixo = eixo;
	}

	public Double getAdicaoReceita() {
	    return adicaoReceita;
	}

	public void setAdicaoReceita(Double adicaoReceita) {
	    this.adicaoReceita = adicaoReceita;
	}


	@Override
    public void imprimirDetalhes() {
        System.out.println("Lente: " + getDescricao() + " - Marca: " + marca);
    }
	
	@Override
    public  double getIncremento() {
        return 0.5; // Lente é vendida em múltiplos de 0,5
    }

	
	
}

