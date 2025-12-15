package br.com.vendas.beans;

public class TratamentoDTO  {

    private int codigo;
    private String nome;
    private String codigo_fornecedor;
    private double venda;

    public TratamentoDTO() {
    }

    public TratamentoDTO(int codigo, String nome, String codigo_fornecedor, double venda) {
        this.codigo = codigo;
        this.nome = nome;
        this.codigo_fornecedor = codigo_fornecedor;
        this.venda = venda;
    }

    public String getCodigo_fornecedor() {
		return codigo_fornecedor;
	}

	public void setCodigo_fornecedor(String codigo_fornecedor) {
		this.codigo_fornecedor = codigo_fornecedor;
	}

	public int getCodigo() {
        return codigo;
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

    public double getVenda() {
        return venda;
    }

    public void setValorVenda(double venda) {
        this.venda = venda;
    }

    @Override
    public String toString() {
        return "TratamentoDTO{" +
                "id=" + codigo +
                ", nome='" + nome + '\'' +
                ", valorVenda=" + venda +
                '}';
    }
}