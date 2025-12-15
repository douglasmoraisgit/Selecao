package br.com.vendas.beans;

/**
 * Bean que representa uma lente com possibilidade de tratamento adicional.
 * 
 * Usado quando:
 * - Lente vem de fábrica com tratamento (origemTratamento = "FABRICA")
 * - Lente BASE precisa de tratamento adicional (origemTratamento = "ADICIONAL")
 * 
 * @author OptoFreela
 */
public class LenteComTratamento2 {

    // ========================================
    // DADOS BÁSICOS DA LENTE (mesmos do LenteODeOE)
    // ========================================
    private int idLente;
    private String codProdFornecedor;
    private String codigoWeb;
    private String marca;
    private String descricao;
    private String tipo;
    private String fotossensivel;
    private String corFoto;
    private Double esferico;
    private Double cilindrico;
    private String fabricante;
    private String familia;
    private String diametro;
    private Double ir;
    private String antiblue;
    private String antireflexo;
    private String arResidual;
    private String tratamento;
    private String material;
    private String cor;
    private Double adicao;
    private Integer alturaMinima;
    private String afinamento;
    private String tecnicaProducao;
    private Double precoCusto;
    private Double precoVenda;
    private Double precoPar;
    private Double precoMinimo;
    private String unidade;
    private String tipoOlho;

    // ========================================
    // NOVOS CAMPOS PARA TRATAMENTO ADICIONAL
    // ========================================
    
    /**
     * Origem do tratamento:
     * - "FABRICA" = lente já vem com o tratamento de fábrica
     * - "ADICIONAL" = lente BASE + tratamento compatível via familia_tratamento
     */
    private String origemTratamento;
    
    /**
     * Dados do tratamento adicional (apenas se origemTratamento = "ADICIONAL")
     */
    private Integer tratamentoAdicionalId;
    private String tratamentoAdicionalNome;
    private String tratamentoAdicionalTipo;
    private Double tratamentoAdicionalValor;

    // ========================================
    // CONSTRUTORES
    // ========================================
    
    public LenteComTratamento2() {
        this.origemTratamento = "FABRICA"; // Padrão
    }
    
    /**
     * Construtor a partir de LenteODeOE
     */
    public LenteComTratamento2(LenteODeOE lente) {
        this.idLente = lente.getIdLente();
        this.codProdFornecedor = lente.getCodProdFornecedor();
        this.codigoWeb = lente.getCodigoWeb();
        this.marca = lente.getMarca();
        this.descricao = lente.getDescricao();
        this.tipo = lente.getTipo();
        this.fotossensivel = lente.getFotossensivel();
        this.corFoto = lente.getCorFoto();
        this.esferico = lente.getEsferico();
        this.cilindrico = lente.getCilindrico();
        this.fabricante = lente.getFabricante();
        this.familia = lente.getFamilia();
        this.diametro = lente.getDiametro();
        this.ir = lente.getIr();
        this.antiblue = lente.getAntiblue();
        this.antireflexo = lente.getAntireflexo();
        this.arResidual = lente.getArResidual();
        this.tratamento = lente.getTratamento();
        this.material = lente.getMaterial();
        this.cor = lente.getCor();
        this.adicao = lente.getAdicao();
        this.alturaMinima = lente.getAlturaMinima();
        this.afinamento = lente.getAfinamento();
        this.tecnicaProducao = lente.getTecnicaProducao();
        this.precoCusto = lente.getPrecoCusto();
        this.precoVenda = lente.getPrecoVenda();
        this.precoMinimo = lente.getPrecoMinimo();
        this.unidade = lente.getUnidade();
        this.tipoOlho = lente.getTipoOlho();
        this.origemTratamento = "FABRICA"; // Vindo de LenteODeOE, é de fábrica
    }

    // ========================================
    // MÉTODOS DE CONVENIÊNCIA
    // ========================================
    
    /**
     * Verifica se a lente precisa de tratamento adicional
     */
    public boolean precisaTratamentoAdicional() {
        return "ADICIONAL".equals(this.origemTratamento) && 
               this.tratamentoAdicionalId != null && 
               this.tratamentoAdicionalId > 0;
    }
    
    /**
     * Calcula o preço total (lente + tratamento adicional se houver)
     */
    public Double getPrecoTotal() {
        double base = this.precoVenda != null ? this.precoVenda : 0.0;
        
        if (precisaTratamentoAdicional() && this.tratamentoAdicionalValor != null) {
            return base + this.tratamentoAdicionalValor;
        }
        
        return base;
    }
    
    /**
     * Retorna descrição completa incluindo tratamento adicional
     */
    public String getDescricaoCompleta() {
        if (precisaTratamentoAdicional() && this.tratamentoAdicionalNome != null) {
            return this.descricao + " + " + this.tratamentoAdicionalNome;
        }
        return this.descricao;
    }

    // ========================================
    // GETTERS E SETTERS - Dados Básicos
    // ========================================
    
    public int getIdLente() {
        return idLente;
    }

    public void setIdLente(int idLente) {
        this.idLente = idLente;
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

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getFotossensivel() {
        return fotossensivel;
    }

    public void setFotossensivel(String fotossensivel) {
        this.fotossensivel = fotossensivel;
    }

    public String getCorFoto() {
        return corFoto;
    }

    public void setCorFoto(String corFoto) {
        this.corFoto = corFoto;
    }

    public Double getEsferico() {
        return esferico;
    }

    public void setEsferico(Double esferico) {
        this.esferico = esferico;
    }

    public Double getCilindrico() {
        return cilindrico;
    }

    public void setCilindrico(Double cilindrico) {
        this.cilindrico = cilindrico;
    }

    public String getFabricante() {
        return fabricante;
    }

    public void setFabricante(String fabricante) {
        this.fabricante = fabricante;
    }

    public String getFamilia() {
        return familia;
    }

    public void setFamilia(String familia) {
        this.familia = familia;
    }

    public String getDiametro() {
        return diametro;
    }

    public void setDiametro(String diametro) {
        this.diametro = diametro;
    }

    public Double getIr() {
        return ir;
    }

    public void setIr(Double ir) {
        this.ir = ir;
    }

    public String getAntiblue() {
        return antiblue;
    }

    public void setAntiblue(String antiblue) {
        this.antiblue = antiblue;
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

    public String getTratamento() {
        return tratamento;
    }

    public void setTratamento(String tratamento) {
        this.tratamento = tratamento;
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

    public Double getAdicao() {
        return adicao;
    }

    public void setAdicao(Double adicao) {
        this.adicao = adicao;
    }

    public Integer getAlturaMinima() {
        return alturaMinima;
    }

    public void setAlturaMinima(Integer alturaMinima) {
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

    public Double getPrecoCusto() {
        return precoCusto;
    }

    public void setPrecoCusto(Double precoCusto) {
        this.precoCusto = precoCusto;
    }

    public Double getPrecoVenda() {
        return precoVenda;
    }

    public void setPrecoVenda(Double precoVenda) {
        this.precoVenda = precoVenda;
    }

    public Double getPrecoPar() {
        return precoPar;
    }

    public void setPrecoPar(Double precoPar) {
        this.precoPar = precoPar;
    }

    public Double getPrecoMinimo() {
        return precoMinimo;
    }

    public void setPrecoMinimo(Double precoMinimo) {
        this.precoMinimo = precoMinimo;
    }

    public String getUnidade() {
        return unidade;
    }

    public void setUnidade(String unidade) {
        this.unidade = unidade;
    }

    public String getTipoOlho() {
        return tipoOlho;
    }

    public void setTipoOlho(String tipoOlho) {
        this.tipoOlho = tipoOlho;
    }

    // ========================================
    // GETTERS E SETTERS - Tratamento Adicional
    // ========================================
    
    public String getOrigemTratamento() {
        return origemTratamento;
    }

    public void setOrigemTratamento(String origemTratamento) {
        this.origemTratamento = origemTratamento;
    }

    public Integer getTratamentoAdicionalId() {
        return tratamentoAdicionalId;
    }

    public void setTratamentoAdicionalId(Integer tratamentoAdicionalId) {
        this.tratamentoAdicionalId = tratamentoAdicionalId;
    }

    public String getTratamentoAdicionalNome() {
        return tratamentoAdicionalNome;
    }

    public void setTratamentoAdicionalNome(String tratamentoAdicionalNome) {
        this.tratamentoAdicionalNome = tratamentoAdicionalNome;
    }

    public String getTratamentoAdicionalTipo() {
        return tratamentoAdicionalTipo;
    }

    public void setTratamentoAdicionalTipo(String tratamentoAdicionalTipo) {
        this.tratamentoAdicionalTipo = tratamentoAdicionalTipo;
    }

    public Double getTratamentoAdicionalValor() {
        return tratamentoAdicionalValor;
    }

    public void setTratamentoAdicionalValor(Double tratamentoAdicionalValor) {
        this.tratamentoAdicionalValor = tratamentoAdicionalValor;
    }

    @Override
    public String toString() {
        return "LenteComTratamento{" +
                "marca='" + marca + '\'' +
                ", familia='" + familia + '\'' +
                ", origemTratamento='" + origemTratamento + '\'' +
                ", tratamentoAdicionalNome='" + tratamentoAdicionalNome + '\'' +
                ", precoVenda=" + precoVenda +
                ", precoTotal=" + getPrecoTotal() +
                '}';
    }
}
