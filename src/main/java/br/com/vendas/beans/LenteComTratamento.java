package br.com.vendas.beans;

/**
 * Bean que representa uma lente com possibilidade de tratamento adicional.
 * 
 * CORREÇÃO: Agora estende Lente para fazer parte da hierarquia Produto
 * 
 * Hierarquia:
 *   Produto (abstract)
 *      └── Lente
 *            └── LenteComTratamento  ← CORRIGIDO!
 * 
 * Usado quando:
 * - Lente vem de fábrica com tratamento (origemTratamento = "FABRICA")
 * - Lente BASE precisa de tratamento adicional (origemTratamento = "ADICIONAL")
 * 
 * @author OptoFreela
 */
public class LenteComTratamento extends Lente {

    // ========================================
    // CAMPOS PARA IDENTIFICAÇÃO
    // ========================================
    
    private String tipoOlho; // "OD" ou "OE" (herdado conceitualmente de LenteODeOE)

    // ========================================
    // CAMPOS PARA TRATAMENTO ADICIONAL
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
    // CAMPOS PARA COLORAÇÃO
    // ========================================
    
    /**
     * Dados da coloração selecionada (serviço adicional)
     * Só aplicável se lente permite_colorir = 'Sim'
     */
    private String coloracaoNome;
    private String coloracaoTipo;  // "Total" ou "Degradê"
    private Double coloracaoValor;
    private String coloracaoHex;   // Cor para preview

    // ========================================
    // CONSTRUTORES
    // ========================================
    
    public LenteComTratamento() {
        super();
        this.origemTratamento = "FABRICA"; // Padrão
    }
    
    /**
     * Construtor a partir de Lente
     */
    public LenteComTratamento(Lente lente) {
        super();
        
        // Copiar campos de Lente
        this.setIdLente(lente.getIdLente());
        if (lente.getChave() != null) {
            this.setChave(lente.getChave());
        }
        this.setCodProdFornecedor(lente.getCodProdFornecedor());
        this.setCodigoWeb(lente.getCodigoWeb());
        this.setMarca(lente.getMarca());
        this.setDescricao(lente.getDescricao());
        this.setTipo(lente.getTipo());
        this.setFotossensivel(lente.getFotossensivel());
        this.setCorFoto(lente.getCorFoto());
        this.setEsferico(lente.getEsferico());
        this.setCilindrico(lente.getCilindrico());
        this.setFabricante(lente.getFabricante());
        this.setFamilia(lente.getFamilia());
        this.setDiametro(lente.getDiametro());
        this.setIr(lente.getIr());
        this.setAntiblue(lente.getAntiblue());
        this.setAntireflexo(lente.getAntireflexo());
        this.setArResidual(lente.getArResidual());
        this.setTratamento(lente.getTratamento());
        this.setMaterial(lente.getMaterial());
        this.setCor(lente.getCor());
        this.setAdicao(lente.getAdicao());
        this.setAlturaMinima(lente.getAlturaMinima());
        this.setAfinamento(lente.getAfinamento());
        this.setTecnicaProducao(lente.getTecnicaProducao());
        this.setPrecoCusto(lente.getPrecoCusto());
        this.setPrecoVenda(lente.getPrecoVenda());
        this.setPrecoPar(lente.getPrecoPar());
        this.setPrecoMinimo(lente.getPrecoMinimo());
        this.setUnidade(lente.getUnidade());
        
        // Campos adicionais de Lente
        this.setMargem(lente.getMargem());
        this.setDistancia(lente.getDistancia());
        this.setLado(lente.getLado());
        this.setVisao(lente.getVisao());
        this.setEsfIni(lente.getEsfIni());
        this.setEsfFim(lente.getEsfFim());
        this.setCilIni(lente.getCilIni());
        this.setCilFim(lente.getCilFim());
        this.setAdiIni(lente.getAdiIni());
        this.setAdiFim(lente.getAdiFim());
        this.setEixo(lente.getEixo());
        this.setAdicaoReceita(lente.getAdicaoReceita());
        
        // Campos de Produto
        this.setId(lente.getId());
        this.setEan(lente.getEan());
        this.setNcm(lente.getNcm());
        this.setModelo(lente.getModelo());
        
        this.origemTratamento = "FABRICA";
    }
    
    /**
     * Construtor a partir de LenteODeOE
     */
    public LenteComTratamento(LenteODeOE lente) {
        this((Lente) lente); // Chama construtor de Lente
        this.tipoOlho = lente.getTipoOlho();
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
     * Verifica se a lente tem coloração selecionada
     */
    public boolean temColoracao() {
        return this.coloracaoNome != null && !this.coloracaoNome.isEmpty();
    }
    
    /**
     * Calcula o preço total (lente + tratamento adicional + coloração se houver)
     */
    public Double getPrecoTotal() {
        double base = this.getPrecoVenda();
        
        // Adiciona tratamento adicional se houver
        if (precisaTratamentoAdicional() && this.tratamentoAdicionalValor != null) {
            base += this.tratamentoAdicionalValor;
        }
        
        // Adiciona coloração se houver
        if (temColoracao() && this.coloracaoValor != null) {
            base += this.coloracaoValor;
        }
        
        return base;
    }
    
    /**
     * Retorna descrição completa incluindo tratamento adicional
     */
    public String getDescricaoCompleta() {
        if (precisaTratamentoAdicional() && this.tratamentoAdicionalNome != null) {
            return this.getDescricao() + " + " + this.tratamentoAdicionalNome;
        }
        return this.getDescricao();
    }
    
    /**
     * Retorna uma descrição dos tratamentos aplicados
     * CORREÇÃO: Método que era chamado em CarrinhoDistinto mas não existia
     */
    public String getTratamentos() {
        StringBuilder sb = new StringBuilder();
        
        // Tratamento de fábrica (herdado de Lente)
        String tratFabrica = this.getTratamento();
        if (tratFabrica != null && !tratFabrica.isEmpty()) {
            sb.append(tratFabrica);
        }
        
        // Tratamento adicional
        if (precisaTratamentoAdicional() && this.tratamentoAdicionalNome != null) {
            if (sb.length() > 0) sb.append(" + ");
            sb.append(this.tratamentoAdicionalNome);
            if (this.tratamentoAdicionalValor != null) {
                sb.append(" (R$ ").append(String.format("%.2f", this.tratamentoAdicionalValor)).append(")");
            }
        }
        
        // Coloração
        if (temColoracao()) {
            if (sb.length() > 0) sb.append(" + ");
            sb.append("Coloração: ").append(this.coloracaoNome);
            if (this.coloracaoTipo != null) {
                sb.append(" (").append(this.coloracaoTipo).append(")");
            }
            if (this.coloracaoValor != null) {
                sb.append(" R$ ").append(String.format("%.2f", this.coloracaoValor));
            }
        }
        
        return sb.length() > 0 ? sb.toString() : "Sem tratamento";
    }

    // ========================================
    // GETTERS E SETTERS - TipoOlho
    // ========================================
    
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

    // ========================================
    // GETTERS E SETTERS - Coloração
    // ========================================
    
    public String getColoracaoNome() {
        return coloracaoNome;
    }

    public void setColoracaoNome(String coloracaoNome) {
        this.coloracaoNome = coloracaoNome;
    }

    public String getColoracaoTipo() {
        return coloracaoTipo;
    }

    public void setColoracaoTipo(String coloracaoTipo) {
        this.coloracaoTipo = coloracaoTipo;
    }

    public Double getColoracaoValor() {
        return coloracaoValor;
    }

    public void setColoracaoValor(Double coloracaoValor) {
        this.coloracaoValor = coloracaoValor;
    }

    public String getColoracaoHex() {
        return coloracaoHex;
    }

    public void setColoracaoHex(String coloracaoHex) {
        this.coloracaoHex = coloracaoHex;
    }

    @Override
    public String toString() {
        return "LenteComTratamento{" +
                "marca='" + getMarca() + '\'' +
                ", familia='" + getFamilia() + '\'' +
                ", tipoOlho='" + tipoOlho + '\'' +
                ", origemTratamento='" + origemTratamento + '\'' +
                ", tratamentoAdicionalNome='" + tratamentoAdicionalNome + '\'' +
                ", coloracaoNome='" + coloracaoNome + '\'' +
                ", precoVenda=" + getPrecoVenda() +
                ", precoTotal=" + getPrecoTotal() +
                '}';
    }
}
