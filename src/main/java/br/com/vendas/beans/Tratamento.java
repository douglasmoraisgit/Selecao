package br.com.vendas.beans;

public class Tratamento extends Produto {

    private int codigo;
    private String nome;
    private String tipoTratamento;
    private String codigo_fornecedor;
    private Double valorCusto;
    private Double valorVenda;
    private String familia;
    private boolean obrigatorio; // NOVO: Campo obrigatorio

    // Construtor padrão
    public Tratamento() {
    }
    
    public Tratamento(int codigo, String nome, String tipo, String codigo_fornecedor, Double valor) {
        this.codigo = codigo;
        this.nome = nome;
        this.tipoTratamento = tipo;
        this.codigo_fornecedor = codigo_fornecedor;
        this.valorVenda = valor;
    }
    
    // NOVO: Construtor com obrigatorio
    public Tratamento(int codigo, String nome, String tipo, String codigo_fornecedor, Double valor, boolean obrigatorio) {
        this.codigo = codigo;
        this.nome = nome;
        this.tipoTratamento = tipo;
        this.codigo_fornecedor = codigo_fornecedor;
        this.valorVenda = valor;
        this.obrigatorio = obrigatorio;
    }

    public int getCodigo() {
        return codigo;
    }

    public void setCodigo(int codigo) {
        this.codigo = codigo;
    }

    public void setId(int codigo) {
        this.codigo = codigo;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getTipoTratamento() {
        return tipoTratamento;
    }

    public void setTipoTratamento(String tipoTratamento) {
        this.tipoTratamento = tipoTratamento;
    }

    public String getCodigo_fornecedor() {
        return codigo_fornecedor;
    }

    public void setCodigo_fornecedor(String codigo_fornecedor) {
        this.codigo_fornecedor = codigo_fornecedor;
    }

    public Double getValorCusto() {
        return valorCusto;
    }

    public void setValorCusto(Double valorCusto) {
        this.valorCusto = valorCusto;
    }

    public Double getVenda() {
        return valorVenda;
    }

    public void setValorVenda(Double valorVenda) {
        this.valorVenda = valorVenda;
    }
    
    public Double getValorVenda() {
        return valorVenda;
    }

    public String getFamilia() {
        return familia;
    }

    public void setFamilia(String familia) {
        this.familia = familia;
    }
    
    // NOVO: Getter e Setter para obrigatorio
    public boolean isObrigatorio() {
        return obrigatorio;
    }

    public void setObrigatorio(boolean obrigatorio) {
        this.obrigatorio = obrigatorio;
    }

    @Override
    public String toString() {
        return "Tratamento{" +
                "codigo=" + codigo +
                ", nome='" + nome + '\'' +
                ", tipoTratamento='" + tipoTratamento + '\'' +
                ", codigo_fornecedor='" + codigo_fornecedor + '\'' +
                ", valorCusto=" + valorCusto +
                ", valorVenda=" + valorVenda +
                ", familia='" + familia + '\'' +
                ", obrigatorio=" + obrigatorio +
                '}';
    }

    @Override
    public void imprimirDetalhes() {
        System.out.println(this.toString());
    }

    @Override
    public double getIncremento() {
        return 0;
    }
}
