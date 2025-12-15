package br.com.vendas.dao;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import br.com.vendas.beans.Lente;
import br.com.vendas.beans.LenteComTratamento;
import br.com.vendas.beans.LenteODeOE;
import br.com.vendas.beans.Produto;
import br.com.vendas.beans.Tratamento;
import br.com.vendas.beans.ColoracaoBean;

public class LentesDao {
	
	// Função auxiliar para verificar valores nulos


	public String getValueOrDefault(String value) {
	    return value != null ? value : ""; // Retorna o valor ou uma string vazia se for nulo
	}

	public Boolean getBooleanValueOrDefault(Boolean value) {
	    return value != null ? value : false; // Retorna o valor ou false se for nulo
	}
	
	

	private Double getValueOrNull(Double value) {
	    return (value != null) ? value : null;
	}
	
	public void cadastraLentesbatch(List<Lente> lentes) {
	    String sqlProduto = "INSERT INTO Produto (tipo) VALUES (?)"; // Inserção na tabela Produto
	    String sqlLentes = "INSERT INTO Lentes"
	    	    + "("
	    	    + "id, "
	    	    +"cod_web"
	    	    + "cod_prod_fornecedor, "
	    	    + "marca, "
	    	    + "familia, "
	    	    + "descricao, "
	    	    + "esferico, "
	    	    + "cilindrico,"
	    	    + "esf_ini,"
	    	    + "esf_fim,"
	    	    + "cil_ini,"
	    	    + "cil_fim"
	    	    + ") VALUES ("
	    	    + "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
	    
	    
	    
	    try (Connection conexao = ConnectionFactory.getInstance().getConnection()) {
	        conexao.setAutoCommit(false); // Iniciar transação

	        try (PreparedStatement stmtProduto = conexao.prepareStatement(sqlProduto, Statement.RETURN_GENERATED_KEYS);
	             PreparedStatement stmtLentes = conexao.prepareStatement(sqlLentes)) {

	            int count = 0; // Contador para controlar o batch

	            for (Lente lente : lentes) {
	                // Inserir na tabela Produto
	                stmtProduto.setString(1, "Lente"); // Ajuste conforme o tipo
	                stmtProduto.executeUpdate();

	                // Obter o ID gerado para Produto
	                ResultSet rs = stmtProduto.getGeneratedKeys();
	                if (rs.next()) {
	                    long produtoId = rs.getLong(1); // O ID do Produto

	                    // Inserir na tabela Lentes
	                    stmtLentes.setLong(1, produtoId);  // Associando a Lente ao Produto
	                    stmtLentes.setString(2, lente.getCodProdFornecedor());
	                    stmtLentes.setString(3, lente.getMarca());
	                    stmtLentes.setString(4, lente.getFamilia());
	                    stmtLentes.setString(5, lente.getDescricao());
	                    stmtLentes.setObject(6, lente.getEsferico(), java.sql.Types.DOUBLE);
	                    stmtLentes.setObject(7, lente.getCilindrico(), java.sql.Types.DOUBLE);
	                    stmtLentes.setObject(8, getValueOrNull(lente.getEsfIni()), java.sql.Types.DOUBLE);
	                    stmtLentes.setObject(9, getValueOrNull(lente.getEsfFim()), java.sql.Types.DOUBLE);
	                    stmtLentes.setObject(10, getValueOrNull(lente.getCilIni()), java.sql.Types.DOUBLE);
	                    stmtLentes.setObject(11, getValueOrNull(lente.getCilFim()), java.sql.Types.DOUBLE);

	                   
	                    stmtLentes.addBatch();
	                }

	                count++;

	                // Executa o batch a cada 100 lentes ou na última lente
	                if (count % 100 == 0 || lentes.indexOf(lente) == lentes.size() - 1) {
	                    stmtLentes.executeBatch(); // Executa o batch de inserção
	                    System.out.println("Inseridas " + count + " lentes.");
	                }
	            }

	            conexao.commit(); // Commit da transação

	            System.out.println(lentes.size() + " lentes inseridas com sucesso!");

	        } catch (SQLException e) {
	            conexao.rollback(); // Rollback em caso de erro
	            System.err.println("Erro ao inserir lentes: " + e.getMessage());
	        }
	    } catch (SQLException e) {
	        System.err.println("Erro de conexão: " + e.getMessage());
	    }
	}

	
	public void cadastraProdutoLente(String descricao, String marca, double esferico, double cilindrico, String fabricante,String codweb,String codfornecedor, String diametro, double ir, String familia, String antireflexo, String arResidual, String antiblue, String fotossensivel, String tratamento, String tipo, String material, String cor, double adicao, int alturaMinima, String afinamento, String tecnicaProducao, double precoCusto, double precoVenda, double precoPar, double precoMinimo, String unidade) {
	    
	    System.out.println("Chamou cadastraLentes");

	    String sqlProduto = "INSERT INTO Produto (tipo) VALUES (?)"; // Inserir o tipo do produto (Lente)
	    String sqlLentes = "INSERT INTO Lentes ("
	    		+ "id, "
	    		+ "cod_prod_fornecedor, "
	    		+ "marca, "
	    		+ "familia, "
	    		+ "descricao, "
	    		+ "esferico, "
	    		+ "cilindrico, "
	    		+ "fabricante, "
	    		+ "cod_web,"
	    		+ "diametro, "
	    		+ "indice, "
	    		+ "tipo,"
	    		+ "material, "
	    		+ "tecnica_producao, "
	    		+ "antireflexo, "
	    		+ "ar_residual, "
	    		+ "tratamento, "
	    		+ "cor, "
	    		+ "adicao, "
	    		+ "altura_minima,"
	    		+ "afinamento, "
	    		+ "antiblue, "
	    		+ "preco_custo, "
	    		+ "preco_venda,"
	    		+ "preco_minimo, "
	    		+ "unidade) VALUES "
	    		+ "("
	    		+ " ?, ?, ?, ?, ?,"
	    		+ " ?, ?, ?, ?, ?,"
	    		+ " ?, ?, ?, ?, ?,"
	    		+ " ?, ?, ?, ?, ?,"
	    		+ " ?, ?, ?, ?, ?"
	    		+ " ?"
	    		+")";

	    try (Connection conexao = ConnectionFactory.getInstance().getConnection();
	         PreparedStatement stmtProduto = conexao.prepareStatement(sqlProduto, Statement.RETURN_GENERATED_KEYS);
	         PreparedStatement stmtLentes = conexao.prepareStatement(sqlLentes)) {

	        // Inserir na tabela Produto
	        stmtProduto.setString(1, "Lente"); // Define o tipo como Lente
	        int rowsInsertedProduto = stmtProduto.executeUpdate();
	        if (rowsInsertedProduto > 0) {
	            ResultSet generatedKeys = stmtProduto.getGeneratedKeys();
	            if (generatedKeys.next()) {
	                long produtoId = generatedKeys.getLong(1); // Obtém o ID gerado para o produto

	                // Inserir na tabela Lentes
	                stmtLentes.setLong(1, produtoId);  // Usar o ID gerado da tabela Produto
	                stmtLentes.setString(2, null); // cod_prod_fornecedor (a ser ajustado conforme necessário)
	                stmtLentes.setString(3, marca);
	                stmtLentes.setString(4, familia);
	                stmtLentes.setString(5, descricao);
	                stmtLentes.setDouble(6, esferico);
	                stmtLentes.setDouble(7, cilindrico);
	                stmtLentes.setString(8, fabricante);
	                stmtLentes.setString(9, diametro);
	                stmtLentes.setDouble(10, ir); // Índice de refração
	                stmtLentes.setString(11, tipo);
	                stmtLentes.setString(12, material);
	                stmtLentes.setString(13, tecnicaProducao);
	                stmtLentes.setString(14, antireflexo);
	                stmtLentes.setString(15, arResidual);
	                stmtLentes.setString(16, tratamento);
	                stmtLentes.setString(17, cor);
	                stmtLentes.setDouble(18, adicao);
	                stmtLentes.setInt(19, alturaMinima);
	                stmtLentes.setString(20, afinamento);
	                stmtLentes.setString(21, antiblue);
	                stmtLentes.setDouble(22, precoCusto);
	                stmtLentes.setDouble(23, precoVenda);
	                stmtLentes.setDouble(24, precoMinimo);
	                stmtLentes.setString(25, unidade);

	                int rowsInsertedLentes = stmtLentes.executeUpdate();
	                if (rowsInsertedLentes > 0) {
	                    System.out.println("Lente inserida com sucesso!");
	                }
	            }
	        }
	    } catch (SQLException e) {
	        System.err.println("Erro ao inserir produto: " + e.getMessage());
	    }
	}

/*	public void cadastraLentes(String descricao, String marca, double esferico, double cilindrico, String fabricante, String diametro, double ir, String familia, String antireflexo, String arResidual, String antiblue, String fotossensivel, String tratamento, String tipo, String material, String cor, double adicao, int alturaMinima, String afinamento, String tecnicaProducao, double precoCusto, double precoVenda, double precoPar, double precoMinimo, String unidade) {
	    
		System.out.println("Chamou cadastraLentes****");
		
		String sql = "INSERT INTO produtoteste (marca, familia, descricao, esferico, cilindrico, fabricante, diametro, indice, tipo, material, tecnica_producao, antireflexo, ar_residual, tratamento, cor, adicao, altura_minima, afinamento, antiblue, preco_custo, preco_venda, preco_minimo, unidade) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

	    try (Connection conexao = ConnectionFactory.getInstance().getConnection();
	    		PreparedStatement stmt = conexao.prepareStatement(sql)) {
	        stmt.setString(1, marca);
	        stmt.setString(2, familia);
	        stmt.setString(3, descricao);
	        stmt.setDouble(4, esferico);
	        stmt.setDouble(5, cilindrico);
	        stmt.setString(6, fabricante);
	        stmt.setString(7, diametro);
	        stmt.setDouble(8, ir); // Considerando que "indice" refere-se a "ir" (índice de refração)
	        stmt.setString(9, tipo);
	        stmt.setString(10, material);
	        stmt.setString(11, tecnicaProducao);
	        stmt.setString(12, antireflexo);
	        stmt.setString(13, arResidual);
	        stmt.setString(14, tratamento); 
	        stmt.setString(15, cor);
	        stmt.setDouble(16, adicao);
	        stmt.setInt(17, alturaMinima);
	        stmt.setString(18, afinamento);
	        stmt.setString(19, antiblue);
	        stmt.setDouble(20, precoCusto);
	        stmt.setDouble(21, precoVenda);
	        stmt.setDouble(22, precoMinimo);
	        stmt.setString(23, unidade);
	        

	        int rowsInserted = stmt.executeUpdate();
	        if (rowsInserted > 0) {
	            System.out.println("Produto inserido com sucesso!");
	        }
	    } catch (SQLException e) {
	        System.err.println("Erro ao inserir produto: " + e.getMessage());
	    }
	}
  */
	public void cadastraLentes(
		    String descricao,
		    String codFornecedor,
		    String codWeb,
		    String marca,
		    double esferico,
		    double cilindrico,
		    String fabricante,
		    String diametro,
		    double ir,
		    String familia,
		    String antireflexo,
		    String arResidual,
		    String antiblue,
		    String fotossensivel,
		    String tratamento,
		    String tipo,
		    String material,
		    String cor,
		    double adicao,
		    int alturaMinima,
		    String afinamento,
		    String tecnicaProducao,
		    double precoCusto,
		    double precoVenda,
		    double precoPar, // não usado no SQL atual, mas mantido na assinatura
		    double precoMinimo,
		    String unidade,
		    String visao
		) {
		    System.out.println("Chamou cadastraLentes****");
		    System.out.println("Producao "+ tecnicaProducao);
		    String sql = "INSERT INTO produtoteste " +
		        "(marca, familia, descricao, cod_web, cod_prod_fornecedor, esferico, cilindrico, fabricante, diametro, indice, tipo, material,producao, antireflexo, ar_residual, tratamento, cor, adicao, altura_minima, afinamento, antiblue, preco_custo, preco_venda, preco_minimo, unidade,visao) " +
		        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)";

		    try (Connection conexao = ConnectionFactory.getInstance().getConnection();
		         PreparedStatement stmt = conexao.prepareStatement(sql)) {

		        stmt.setString(1, marca);
		        stmt.setString(2, familia);
		        stmt.setString(3, descricao);
		        stmt.setString(4, codWeb);
		        stmt.setString(5, codFornecedor);
		        stmt.setDouble(6, esferico);
		        stmt.setDouble(7, cilindrico);
		        stmt.setString(8, fabricante);
		        stmt.setString(9, diametro);
		        stmt.setDouble(10, ir); // índice de refração
		        stmt.setString(11, tipo);
		        stmt.setString(12, material);
		        stmt.setString(13, tecnicaProducao);
		        stmt.setString(14, antireflexo);
		        stmt.setString(15, arResidual);
		        stmt.setString(16, tratamento);
		        stmt.setString(17, cor);
		        stmt.setDouble(18, adicao);
		        stmt.setInt(19, alturaMinima);
		        stmt.setString(20, afinamento);
		        stmt.setString(21, antiblue);
		        stmt.setDouble(22, precoCusto);
		        stmt.setDouble(23, precoVenda);
		        stmt.setDouble(24, precoMinimo);
		        stmt.setString(25, unidade);
		        stmt.setString(26, visao);
		      

		        int rowsInserted = stmt.executeUpdate();
		        if (rowsInserted > 0) {
		            System.out.println("Produto inserido com sucesso! → " + codFornecedor);
		        }

		    } catch (SQLException e) {
		        System.err.println("Erro ao inserir produto: " + e.getMessage());
		    }
		}

	public Lente getLente(int id) {
		Lente lente = new Lente();
		
		try {Connection conexao = ConnectionFactory.getInstance().getConnection();
		
			PreparedStatement stmt = conexao.prepareStatement("select * from produtoteste where idprodutoteste="+id);
			ResultSet rs = stmt.executeQuery();
			while (rs.next()) {
				// criando o objeto cliente
			
				lente.setIdLente(rs.getInt("idprodutoteste"));
	            lente.setCodProdFornecedor(rs.getString("cod_prod_fornecedor"));
	            lente.setCodigoWeb(rs.getString("cod_web"));
	            lente.setMarca(rs.getString("marca"));
	            lente.setDescricao(rs.getString("descricao"));
	            lente.setEsferico(rs.getDouble("esferico"));
	            lente.setCilindrico(rs.getDouble("cilindrico"));
	            lente.setEixo(null);
	            lente.setAdicao(rs.getDouble("adicao"));
	            lente.setFabricante(rs.getString("fabricante"));
	            lente.setFamilia(rs.getString("familia"));
	            lente.setDiametro(rs.getString("diametro"));
	            lente.setIr(rs.getDouble("indice"));
	            lente.setAntireflexo(rs.getString("antireflexo"));
	            lente.setArResidual(rs.getString("ar_residual"));
	            lente.setTratamento(rs.getString("tratamento"));
	            lente.setTipo(rs.getString("tipo"));
	            lente.setMaterial(rs.getString("material"));
	            lente.setCor(rs.getString("cor"));
	            lente.setAdicao(rs.getDouble("adicao"));
	            lente.setAlturaMinima(rs.getInt("altura_minima"));
	            lente.setAfinamento(rs.getString("afinamento"));
	            lente.setTecnicaProducao(rs.getString("tecnica_producao"));
	            lente.setPrecoCusto(rs.getDouble("preco_custo"));
	            lente.setPrecoVenda(rs.getDouble("preco_venda"));
	            lente.setPrecoMinimo(rs.getDouble("preco_minimo"));
	            lente.setPrecoPar(rs.getDouble("preco_par"));
	            lente.setUnidade(rs.getString("unidade"));

	            
			    
			}
			rs.close();
			stmt.close();
			
		}   catch (SQLException e) {
			throw new RuntimeException(e);
		}
		return lente;
	}
	
//metodo pra lidar com getTratamento<Tratamento>
	public Lente getLenteTratamento(int id) { 
	    Lente lente = new Lente();
	    
	    String sql = "SELECT * FROM produtoteste WHERE idprodutoteste = ?";
	    
	    try (Connection conexao = ConnectionFactory.getInstance().getConnection();
	         PreparedStatement stmt = conexao.prepareStatement(sql)) {

	        stmt.setInt(1, id); // Substitui o ID no SQL de forma segura
	        try (ResultSet rs = stmt.executeQuery()) {
	            if (rs.next()) {
	                // Mapeando o JSON da coluna `tratamento` para uma lista
	                String tratamentoJson = rs.getString("tratamento");
	                ObjectMapper mapper = new ObjectMapper();
	                List<Tratamento> tratamentos = mapper.readValue(tratamentoJson, new TypeReference<List<Tratamento>>() {});

	                // Preenchendo os atributos do objeto Lente
	                lente.setIdLente(rs.getInt("idprodutoteste"));
	                lente.setCodProdFornecedor(rs.getString("cod_prod_fornecedor"));
	                lente.setMarca(rs.getString("marca"));
	                lente.setDescricao(rs.getString("descricao"));
	                lente.setEsferico(rs.getDouble("esferico"));
	                lente.setCilindrico(rs.getDouble("cilindrico"));
	                lente.setFabricante(rs.getString("fabricante"));
	                lente.setFamilia(rs.getString("familia"));
	                lente.setDiametro(rs.getString("diametro"));
	                lente.setIr(rs.getDouble("indice"));
	                lente.setAntireflexo(rs.getString("antireflexo"));
	                lente.setArResidual(rs.getString("ar_residual"));
	                lente.setTratamentos(tratamentos); // Atribui a lista convertida
	                lente.setTipo(rs.getString("tipo"));
	                lente.setMaterial(rs.getString("material"));
	                lente.setCor(rs.getString("cor"));
	                lente.setAdicao(rs.getDouble("adicao"));
	                lente.setAlturaMinima(rs.getInt("altura_minima"));
	                lente.setAfinamento(rs.getString("afinamento"));
	                lente.setTecnicaProducao(rs.getString("tecnica_producao"));
	                lente.setPrecoCusto(rs.getDouble("preco_custo"));
	                lente.setPrecoVenda(rs.getDouble("preco_venda"));
	                lente.setPrecoMinimo(rs.getDouble("preco_minimo"));
	                lente.setPrecoPar(rs.getDouble("preco_par"));
	                lente.setUnidade(rs.getString("unidade"));
	            }
	        }
	    } catch (Exception e) {
	        e.printStackTrace();
	        throw new RuntimeException(e);
	    }
	    return lente;
	}



	
	public void gravaLente(Lente lente) {
		String sql = "insert into " + "produtoteste" + "(" + "visao," + "codProdFornecedor," + "producao," + "fabricante,"
				+ "marcaLente," + "material," + "antireflexo," + "tratamento," + "descricao," + "fotossensivel,"
				+ "indice," + "afinamento," + "esf_ini," + "esf_fim," + "cil_ini," + "cil_fim," + "ad_ini," + "ad_fim,"
				+ "altura," + "valor" + ")" + "values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
		try {Connection conexao = ConnectionFactory.getInstance().getConnection();
			// prepared statement para inser  o
			PreparedStatement stmt = conexao.prepareStatement(sql);
			// seta os valores
			
			stmt.setString(2, lente.getCodProdFornecedor());
		
			stmt.execute();
			System.out.println("Gravado pelo LenteDao.gravaLente(Lente lente)");
			stmt.close();
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}
	

	
	public List<Lente> getLentesList(String converteGrau) throws SQLException {

		Connection conexao = ConnectionFactory.getInstance().getConnection();
		List<Lente> lentes = new ArrayList<Lente>();
		PreparedStatement stmt = conexao
				.prepareStatement("select * from produtoteste where " + converteGrau);
		ResultSet rs = stmt.executeQuery();
		NumberFormat moeda = NumberFormat.getCurrencyInstance();
		while (rs.next()) {
			Lente lente = new Lente();
			lente.setIdLente(rs.getInt("idprodutoteste"));
            lente.setCodProdFornecedor(rs.getString("cod_prod_fornecedor"));
            lente.setMarca(rs.getString("marca"));
            lente.setDescricao(rs.getString("descricao"));
            lente.setTipo(rs.getString("tipo"));
            lente.setEsferico(rs.getDouble("esferico"));
            lente.setCilindrico(rs.getDouble("cilindrico"));
            lente.setFabricante(rs.getString("fabricante"));
            lente.setFamilia(rs.getString("familia"));
            lente.setDiametro(rs.getString("diametro"));
            lente.setIr(rs.getDouble("indice"));
            lente.setAntireflexo(rs.getString("antireflexo"));
            lente.setArResidual(rs.getString("ar_residual"));
            lente.setTratamento(rs.getString("tratamento"));
            lente.setTipo(rs.getString("tipo"));
            lente.setMaterial(rs.getString("material"));
            lente.setCor(rs.getString("cor"));
            lente.setAdicao(rs.getDouble("adicao"));
            lente.setAlturaMinima(rs.getInt("altura_minima"));
            lente.setAfinamento(rs.getString("afinamento"));
            lente.setTecnicaProducao(rs.getString("tecnica_producao"));
            lente.setPrecoCusto(rs.getDouble("preco_custo"));
            lente.setPrecoVenda(rs.getDouble("preco_venda"));
            lente.setPrecoMinimo(rs.getDouble("preco_minimo"));
            lente.setPrecoPar(rs.getDouble("preco_par"));
            lente.setUnidade(rs.getString("unidade"));
           
            lentes.add(lente);
			
		}
		return lentes;

	}
	
	public LentesJSON getLentesJSON(Double esferico, Double cilindrico, String tipoOlho) throws SQLException {
        LentesJSON lentesJSON = new LentesJSON();
    
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {Connection conexao = ConnectionFactory.getInstance().getConnection();
            
            stmt = conexao.prepareStatement("SELECT * FROM produtoteste WHERE esferico = ? AND cilindrico = ?");
            stmt.setDouble(1, esferico);
            stmt.setDouble(2, cilindrico);
            rs = stmt.executeQuery();

            NumberFormat moeda = NumberFormat.getCurrencyInstance();
            while (rs.next()) {
                String descricao = rs.getString("descricao");
                String tipo = rs.getString("tipo");
                Double esfericoValor = rs.getDouble("esferico");
                Double cilindricoValor = rs.getDouble("cilindrico");
                String codigo = String.valueOf(rs.getInt("idprodutoteste"));

                Map<String, String> lenteData = new HashMap<>();
                lenteData.put("codigo", codigo);
                lenteData.put("cil", String.valueOf(cilindricoValor));
                lenteData.put("esf", String.valueOf(esfericoValor));

                if (!lentesJSON.getLentes().containsKey(descricao)) {
                    lentesJSON.getLentes().put(descricao, new HashMap<>());
                }

                if (!lentesJSON.getLentes().get(descricao).containsKey(tipoOlho)) {
                    lentesJSON.getLentes().get(descricao).put(tipoOlho, new ArrayList<>());
                }

                lentesJSON.getLentes().get(descricao).get(tipoOlho).add(lenteData);
            }
        } catch (SQLException e) {
            throw e;
        } finally {
	        // Fechar recursos em um bloco finally para garantir que sempre sejam fechados, mesmo em caso de exceção
	        if (rs != null) {
	            rs.close();
	        }
	        if (stmt != null) {
	            stmt.close();
	        }
	    }
	    return lentesJSON;
	}

	
	public List<LenteODeOE> buscarProdutosPorDescricao(String busca) {
	    List<LenteODeOE> lentes = new ArrayList<>();
	    String buscaFormatada = formatarStringDeBusca(busca);
       
	    Connection conexao = ConnectionFactory.getInstance().getConnection();

	    String sql = "SELECT * FROM produtoteste WHERE descricao LIKE ?";
	    try (PreparedStatement stmt = conexao.prepareStatement(sql)) {
	        stmt.setString(1, "%" + buscaFormatada + "%"); // Definindo o parâmetro para LIKE

	        try (ResultSet rs = stmt.executeQuery()) {
	            while (rs.next()) {
	                LenteODeOE lente = new LenteODeOE();
	                
	                lente.setIdLente(rs.getInt("idprodutoteste"));
	                lente.setMarca(rs.getString("marca"));
	                lente.setDescricao(rs.getString("descricao"));
	                lente.setTipo(rs.getString("tipo"));

	                lente.setEsferico(rs.getDouble("esferico"));
	                lente.setCilindrico(rs.getDouble("cilindrico"));
	                lentes.add(lente);
	            }
	        }
	    } catch (SQLException e) {
	        e.printStackTrace();
	    }
	    return lentes;
	}
	
	public List<LenteODeOE> getLentesModificadas(Double esferico, Double cilindrico, String tipoOlho) 
			throws SQLException {
        List<LenteODeOE> lentes = new ArrayList<>();
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {Connection conexao = ConnectionFactory.getInstance().getConnection();
           
            stmt = conexao.prepareStatement("SELECT * FROM produtoteste WHERE esferico = ? AND cilindrico = ?");
            stmt.setDouble(1, esferico);
            stmt.setDouble(2, cilindrico);
            rs = stmt.executeQuery();

            while (rs.next()) {
                LenteODeOE lente = new LenteODeOE();
                lente.setIdLente(rs.getInt("idprodutoteste"));
                lente.setMarca(rs.getString("marca"));
                lente.setDescricao(rs.getString("descricao"));
                lente.setEsferico(rs.getDouble("esferico"));
                lente.setCilindrico(rs.getDouble("cilindrico"));
                lente.setTratamento(rs.getString("tratamento"));
                lente.setTipoOlho(tipoOlho);
                lentes.add(lente);
            }
        } catch (SQLException e) {
            throw e; // Lança a exceção para que o chamador possa lidar com ela
        } finally {
	        // Fechar recursos em um bloco finally para garantir que sempre sejam fechados, mesmo em caso de exceção
	        if (rs != null) {
	            rs.close();
	        }
	        if (stmt != null) {
	            stmt.close();
	        }
	    }
	    return lentes;
	}

	public List<LenteODeOE> getLentes(String converteGrau,String tipoOlho) throws SQLException {
		 List<LenteODeOE> lentes = new ArrayList<>();
		 Connection conexao = ConnectionFactory.getInstance().getConnection();
		PreparedStatement stmt = conexao.prepareStatement("select * from produtoteste where " + converteGrau);
		System.out.println("String SQL : "+ converteGrau);
		ResultSet rs = stmt.executeQuery();
		NumberFormat moeda = NumberFormat.getCurrencyInstance();
		while (rs.next()) {
			LenteODeOE lente = new LenteODeOE();
            
			lente.setIdLente(rs.getInt("idprodutoteste"));
            lente.setCodProdFornecedor(rs.getString("cod_prod_fornecedor"));
            lente.setCodigoWeb(rs.getString("cod_web"));
            lente.setMarca(rs.getString("marca"));
            lente.setDescricao(rs.getString("descricao"));
            lente.setTipo(rs.getString("tipo"));
            lente.setFotossensivel(rs.getString("fotossensivel"));
            lente.setCorFoto(rs.getString("cor_foto"));
            lente.setEsferico(rs.getDouble("esferico"));
            lente.setCilindrico(rs.getDouble("cilindrico"));
            lente.setFabricante(rs.getString("fabricante"));
            lente.setFamilia(rs.getString("familia"));
            lente.setDiametro(rs.getString("diametro"));
            lente.setIr(rs.getDouble("indice"));
            lente.setAntiblue(rs.getString("antiblue"));
            lente.setAntireflexo(rs.getString("antireflexo"));
            lente.setArResidual(rs.getString("ar_residual"));
            lente.setTratamento(rs.getString("tratamento"));
            lente.setTipo(rs.getString("tipo"));
            lente.setMaterial(rs.getString("material"));
            lente.setCor(rs.getString("cor"));
            lente.setAdicao(rs.getDouble("adicao"));
            lente.setAlturaMinima(rs.getInt("altura_minima"));
            lente.setAfinamento(rs.getString("afinamento"));
            lente.setTecnicaProducao(rs.getString("producao"));
            lente.setPrecoCusto(rs.getDouble("preco_custo"));
            lente.setPrecoVenda(rs.getDouble("preco_venda"));
            lente.setPrecoMinimo(rs.getDouble("preco_minimo"));
            lente.setUnidade(rs.getString("unidade"));
            System.out.println("marcas  :" + lente.getMarca());
            System.out.println("Unidade :" + lente.getUnidade());
            lente.setTipoOlho(tipoOlho);
            lentes.add(lente);
		}
		return lentes;

	}
	/**
	 * Busca lentes com fallback para tratamentos compatíveis.
	 * 
	 * LÓGICA:
	 * 1. Se filtro de antireflexo foi aplicado, primeiro tenta busca normal
	 * 2. Se não encontrar lentes com AR de fábrica, busca lentes BASE
	 *    que são compatíveis com o tratamento via familia_tratamento
	 * 3. Retorna lista combinada marcando a origem (FABRICA ou ADICIONAL)
	 * 
	 * @param converteGrau Filtros de grau (receita)
	 * @param tipoOlho "od" ou "oe"
	 * @param filtroAntireflexo Nome do antireflexo selecionado (pode ser null)
	 * @return Lista de LenteComTratamento
	 */
/*	public List<LenteComTratamento> getLentesComFallback(
	        String converteGrau, 
	        String tipoOlho, 
	        String filtroAntireflexo) throws SQLException {
	    
	    List<LenteComTratamento> resultado = new ArrayList<>();
	    
	    // 1. Busca normal (lentes que já vêm com o AR de fábrica)
	    List<LenteODeOE> lentesNormais = getLentes(converteGrau, tipoOlho);
	    
	    // Converte para LenteComTratamento marcando como FABRICA
	    for (LenteODeOE lente : lentesNormais) {
	        LenteComTratamento lct = new LenteComTratamento(lente);
	        lct.setOrigemTratamento("FABRICA");
	        resultado.add(lct);
	    }
	    
	    // 2. Se há filtro de AR e encontrou poucas lentes, tenta fallback
	    if (filtroAntireflexo != null && !filtroAntireflexo.isEmpty()) {
	        
	        // Monta query SEM o filtro de antireflexo para buscar lentes BASE
	        String filtroSemAR = removerFiltroAntireflexo(converteGrau);
	        
	        // Busca lentes BASE + tratamento compatível
	        List<LenteComTratamento> lentesComTratamento = 
	            buscarLentesBaseComTratamento(filtroSemAR, tipoOlho, filtroAntireflexo);
	        
	        // Adiciona ao resultado (evitando duplicatas)
	        for (LenteComTratamento lct : lentesComTratamento) {
	            if (!existeNaLista(resultado, lct)) {
	                resultado.add(lct);
	            }
	        }
	    }
	    
	    System.out.println("📦 Total lentes (com fallback): " + resultado.size());
	    return resultado;
	}
*/
	
	public List<LenteComTratamento> getLentesComFallback(
	        String converteGrau, 
	        String tipoOlho, 
	        String filtroAntireflexo,
	        String filtroColoracao,
	        String filtroColoracaoTipo) throws SQLException {
	    
	    List<LenteComTratamento> resultado = new ArrayList<>();
	    
	    // NOVO: Buscar restrições de AR
	    Set<String> familiasRestritas = getFamiliasComRestricaoAR();
	    Set<String> marcasRestritas = getMarcasComRestricaoAR();
	    boolean temFiltroAR = filtroAntireflexo != null && !filtroAntireflexo.isEmpty();
	    
	    // NOVO: Buscar dados da coloração se selecionada (usando nome E tipo)
	    ColoracaoBean dadosColoracao = null;
	    if (filtroColoracao != null && !filtroColoracao.isEmpty()) {
	        dadosColoracao = buscarDadosColoracao(filtroColoracao, filtroColoracaoTipo);
	        System.out.println("🎨 Dados coloração carregados: " + dadosColoracao);
	    }
	    
	    // 1. Busca normal (lentes que já vêm com o AR de fábrica)
	    List<LenteODeOE> lentesNormais = getLentes(converteGrau, tipoOlho);
	    
	    // Converte para LenteComTratamento marcando como FABRICA
	    for (LenteODeOE lente : lentesNormais) {
	        
	        // NOVO: Se não tem filtro AR e lente é de família/marca restrita, pula
	        if (!temFiltroAR) {
	            if (familiasRestritas.contains(lente.getFamilia())) {
	                System.out.println("🚫 Bloqueada (família restrita sem AR): " + lente.getMarca());
	                continue;
	            }
	            if (marcasRestritas.contains(lente.getMarca())) {
	                System.out.println("🚫 Bloqueada (marca restrita sem AR): " + lente.getMarca());
	                continue;
	            }
	        }
	        
	        LenteComTratamento lct = new LenteComTratamento(lente);
	        lct.setOrigemTratamento("FABRICA");
	        
	        // NOVO: Adiciona dados da coloração se selecionada
	        if (dadosColoracao != null) {
	            lct.setColoracaoNome(dadosColoracao.getNome());
	            lct.setColoracaoTipo(dadosColoracao.getTipo());
	            lct.setColoracaoValor(dadosColoracao.getValorVenda());
	            lct.setColoracaoHex(dadosColoracao.getCorHex());
	        }
	        
	        resultado.add(lct);
	    }
	    
	    // 2. Se há filtro de AR, tenta fallback
	    if (temFiltroAR) {
	        
	        // Monta query SEM o filtro de antireflexo para buscar lentes BASE
	        String filtroSemAR = removerFiltroAntireflexo(converteGrau);
	        
	        // Busca lentes BASE + tratamento compatível
	        List<LenteComTratamento> lentesComTratamento = 
	            buscarLentesBaseComTratamento(filtroSemAR, tipoOlho, filtroAntireflexo);
	        
	        // Adiciona ao resultado (evitando duplicatas)
	        for (LenteComTratamento lct : lentesComTratamento) {
	            if (!existeNaLista(resultado, lct)) {
	                // NOVO: Adiciona dados da coloração também nas lentes com fallback
	                if (dadosColoracao != null) {
	                    lct.setColoracaoNome(dadosColoracao.getNome());
	                    lct.setColoracaoTipo(dadosColoracao.getTipo());
	                    lct.setColoracaoValor(dadosColoracao.getValorVenda());
	                    lct.setColoracaoHex(dadosColoracao.getCorHex());
	                }
	                resultado.add(lct);
	            }
	        }
	    }
	    
	    System.out.println("📦 Total lentes (com fallback): " + resultado.size());
	    return resultado;
	}
	
	/**
	 * NOVO: Busca dados da coloração na tabela coloracao pelo nome
	 * O nome já é único na tabela (ex: "Cinza I" vs "Cinza Degradê I")
	 */
	private ColoracaoBean buscarDadosColoracao(String nomeColoracao, String tipoColoracao) throws SQLException {
	    // Busca apenas pelo nome - que já é único na tabela
	    String sql = "SELECT id, tipo, nome, codigo_fornecedor, valor_custo, valor_venda, cor_hex FROM coloracao WHERE nome = ? AND ativo = 1";
	    
	    try (Connection conexao = ConnectionFactory.getInstance().getConnection();
	         PreparedStatement stmt = conexao.prepareStatement(sql)) {
	        
	        stmt.setString(1, nomeColoracao);
	        
	        try (ResultSet rs = stmt.executeQuery()) {
	            if (rs.next()) {
	                ColoracaoBean cor = new ColoracaoBean();
	                cor.setCodigo(rs.getInt("id"));
	                cor.setTipo(rs.getString("tipo"));
	                cor.setNome(rs.getString("nome"));
	                cor.setCodigoFornecedor(rs.getString("codigo_fornecedor"));
	                cor.setValorCusto(rs.getDouble("valor_custo"));
	                cor.setValorVenda(rs.getDouble("valor_venda"));
	                cor.setCorHex(rs.getString("cor_hex"));
	                System.out.println("✅ Coloração encontrada: " + cor.getNome() + " (" + cor.getTipo() + ") - R$ " + cor.getValorVenda());
	                return cor;
	            }
	        }
	    }
	    
	    System.out.println("⚠️ Coloração não encontrada na tabela: " + nomeColoracao);
	    return null;
	}
	
	
	/**
	 * Busca lentes BASE (sem AR) que são compatíveis com o tratamento selecionado
	 * via tabela familia_tratamento.
	 */
	private List<LenteComTratamento> buscarLentesBaseComTratamento(
	        String filtroGrau, 
	        String tipoOlho, 
	        String nomeTratamento) throws SQLException {
	    
	    List<LenteComTratamento> lentes = new ArrayList<>();
	    
	    // Query que busca lentes BASE + valida compatibilidade via familia_tratamento
	    String sql = """
	        SELECT p.*, 
	               t.id AS trat_id,
	               t.nome AS trat_nome,
	               t.tipoTratamento AS trat_tipo,
	               t.valor_venda AS trat_valor
	        FROM produtoteste p
	        INNER JOIN familia f ON p.familia = f.nome
	        INNER JOIN familia_tratamento ft ON f.id = ft.familia_id
	        INNER JOIN tratamento t ON ft.tratamento_id = t.id
	        WHERE (p.antireflexo IS NULL OR p.antireflexo = '' OR p.antireflexo = 'Não' OR p.antireflexo = 'não')
	          AND t.nome = ?
	          AND """ + filtroGrau;
	    
	    System.out.println("🔍 SQL Fallback: " + sql);
	    System.out.println("🔍 Tratamento buscado: " + nomeTratamento);
	    
	    try (Connection conexao = ConnectionFactory.getInstance().getConnection();
	         PreparedStatement stmt = conexao.prepareStatement(sql)) {
	        
	        stmt.setString(1, nomeTratamento);
	        
	        try (ResultSet rs = stmt.executeQuery()) {
	            while (rs.next()) {
	                LenteComTratamento lente = mapearResultSetParaLenteComTratamento(rs, tipoOlho);
	                
	                // Dados do tratamento adicional
	                lente.setTratamentoAdicionalId(rs.getInt("trat_id"));
	                lente.setTratamentoAdicionalNome(rs.getString("trat_nome"));
	                lente.setTratamentoAdicionalTipo(rs.getString("trat_tipo"));
	                lente.setTratamentoAdicionalValor(rs.getDouble("trat_valor"));
	                lente.setOrigemTratamento("ADICIONAL");
	                
	                lentes.add(lente);
	                
	                System.out.println("✅ Lente BASE compatível: " + lente.getMarca() + 
	                    " + " + lente.getTratamentoAdicionalNome() + 
	                    " (R$ " + lente.getTratamentoAdicionalValor() + ")");
	            }
	        }
	    }
	    
	    System.out.println("📦 Lentes BASE encontradas: " + lentes.size());
	    return lentes;
	}

	/**
	 * Mapeia ResultSet para LenteComTratamento
	 */
	private LenteComTratamento mapearResultSetParaLenteComTratamento(ResultSet rs, String tipoOlho) 
	        throws SQLException {
	    
	    LenteComTratamento lente = new LenteComTratamento();
	    
	    lente.setIdLente(rs.getInt("idprodutoteste"));
	    lente.setCodProdFornecedor(rs.getString("cod_prod_fornecedor"));
	    lente.setCodigoWeb(rs.getString("cod_web"));
	    lente.setMarca(rs.getString("marca"));
	    lente.setDescricao(rs.getString("descricao"));
	    lente.setTipo(rs.getString("tipo"));
	    lente.setFotossensivel(rs.getString("fotossensivel"));
	    lente.setCorFoto(rs.getString("cor_foto"));
	    lente.setEsferico(rs.getDouble("esferico"));
	    lente.setCilindrico(rs.getDouble("cilindrico"));
	    lente.setFabricante(rs.getString("fabricante"));
	    lente.setFamilia(rs.getString("familia"));
	    lente.setDiametro(rs.getString("diametro"));
	    lente.setIr(rs.getDouble("indice"));
	    lente.setAntiblue(rs.getString("antiblue"));
	    lente.setAntireflexo(rs.getString("antireflexo"));
	    lente.setArResidual(rs.getString("ar_residual"));
	    lente.setTratamento(rs.getString("tratamento"));
	    lente.setMaterial(rs.getString("material"));
	    lente.setCor(rs.getString("cor"));
	    lente.setAdicao(rs.getDouble("adicao"));
	    lente.setAlturaMinima(rs.getInt("altura_minima"));
	    lente.setAfinamento(rs.getString("afinamento"));
	    lente.setTecnicaProducao(rs.getString("producao"));
	    lente.setPrecoCusto(rs.getDouble("preco_custo"));
	    lente.setPrecoVenda(rs.getDouble("preco_venda"));
	    lente.setPrecoMinimo(rs.getDouble("preco_minimo"));
	    lente.setUnidade(rs.getString("unidade"));
	    lente.setTipoOlho(tipoOlho);
	    
	    return lente;
	}
	
	/**
	 * Busca todas as restrições ativas de Anti-Reflexo.
	 * Retorna Set com nomes de famílias/marcas que EXIGEM AR.
	 */
	public Set<String> getFamiliasComRestricaoAR() throws SQLException {
	    Set<String> restricoes = new HashSet<>();
	    
	    String sql = """
	        SELECT codigo_item 
	        FROM restricao_tratamento 
	        WHERE tipo_restricao = 'FAMILIA' 
	          AND tipo_tratamento = 'Anti-Reflexo'
	          AND ativo = TRUE
	    """;
	    
	    try (Connection conn = ConnectionFactory.getInstance().getConnection();
	         PreparedStatement stmt = conn.prepareStatement(sql);
	         ResultSet rs = stmt.executeQuery()) {
	        
	        while (rs.next()) {
	            restricoes.add(rs.getString("codigo_item"));
	        }
	    }
	    
	    System.out.println("🔒 Famílias com restrição AR: " + restricoes);
	    return restricoes;
	}

	/**
	 * Busca marcas com restrição de Anti-Reflexo.
	 */
	public Set<String> getMarcasComRestricaoAR() throws SQLException {
	    Set<String> restricoes = new HashSet<>();
	    
	    String sql = """
	        SELECT codigo_item 
	        FROM restricao_tratamento 
	        WHERE tipo_restricao = 'MARCA' 
	          AND tipo_tratamento = 'Anti-Reflexo'
	          AND ativo = TRUE
	    """;
	    
	    try (Connection conn = ConnectionFactory.getInstance().getConnection();
	         PreparedStatement stmt = conn.prepareStatement(sql);
	         ResultSet rs = stmt.executeQuery()) {
	        
	        while (rs.next()) {
	            restricoes.add(rs.getString("codigo_item"));
	        }
	    }
	    
	    System.out.println("🔒 Marcas com restrição AR: " + restricoes);
	    return restricoes;
	}

	/**
	 * Remove o filtro de antireflexo da string de filtros
	 */
	private String removerFiltroAntireflexo(String filtro) {
	    if (filtro == null) return "";
	    
	    // Remove padrões como: (antireflexo = 'Crizal Sapphire') AND
	    //                  ou: AND (antireflexo = 'Crizal Sapphire')
	    String resultado = filtro
	        .replaceAll("\\(antireflexo\\s*=\\s*'[^']*'(\\s+OR\\s+antireflexo\\s*=\\s*'[^']*')*\\)\\s*AND\\s*", "")
	        .replaceAll("\\s*AND\\s*\\(antireflexo\\s*=\\s*'[^']*'(\\s+OR\\s+antireflexo\\s*=\\s*'[^']*')*\\)", "")
	        .replaceAll("\\(antireflexo\\s*=\\s*'[^']*'(\\s+OR\\s+antireflexo\\s*=\\s*'[^']*')*\\)", "")
	        .trim();
	    
	    // Remove AND solto no início ou fim
	    resultado = resultado.replaceAll("^\\s*AND\\s*", "").replaceAll("\\s*AND\\s*$", "").trim();
	    
	    // Se ficou vazio, retorna 1=1 para não quebrar a query
	    if (resultado.isEmpty()) {
	        resultado = "1=1";
	    }
	    
	    return resultado;
	}

	/**
	 * Verifica se a lente já existe na lista (por codigoWeb)
	 */
	private boolean existeNaLista(List<LenteComTratamento> lista, LenteComTratamento lente) {
	    for (LenteComTratamento l : lista) {
	        if (l.getCodigoWeb() != null && l.getCodigoWeb().equals(lente.getCodigoWeb())) {
	            return true;
	        }
	    }
	    return false;
	}

	// ============================================================
	// IMPORT NECESSÁRIO (adicionar no topo do arquivo):
	// import br.com.vendas.beans.LenteComTratamento;
	// ============================================================

	public List<LenteODeOE> getMultifocais(String converteGrau,String tipoOlho) throws SQLException {
		 List<LenteODeOE> lentes = new ArrayList<>();
		 Connection conexao = ConnectionFactory.getInstance().getConnection();
		PreparedStatement stmt = conexao.prepareStatement("select * from produtoteste where " + converteGrau);
		System.out.println("String SQL : "+ converteGrau);
		ResultSet rs = stmt.executeQuery();
		NumberFormat moeda = NumberFormat.getCurrencyInstance();
		while (rs.next()) {
			LenteODeOE lente = new LenteODeOE();
           
			lente.setIdLente(rs.getInt("idprodutoteste"));
           lente.setCodProdFornecedor(rs.getString("cod_prod_fornecedor"));
           lente.setMarca(rs.getString("marca"));
           lente.setDescricao(rs.getString("descricao"));
           lente.setTipo(rs.getString("tipo"));

           lente.setEsferico(rs.getDouble("esferico"));
           lente.setCilindrico(rs.getDouble("cilindrico"));
           lente.setFabricante(rs.getString("fabricante"));
           lente.setFamilia(rs.getString("familia"));
           lente.setDiametro(rs.getString("diametro"));
           lente.setIr(rs.getDouble("indice"));
           lente.setAntireflexo(rs.getString("antireflexo"));
           lente.setArResidual(rs.getString("ar_residual"));
           lente.setTratamento(rs.getString("tratamento"));
           lente.setTipo(rs.getString("tipo"));
           lente.setMaterial(rs.getString("material"));
           lente.setCor(rs.getString("cor"));
           lente.setAdicao(rs.getDouble("adicao"));
           lente.setAlturaMinima(rs.getInt("altura_minima"));
           lente.setAfinamento(rs.getString("afinamento"));
           //lente.setTecnicaProducao(rs.getString("tecnica_producao"));
           lente.setTecnicaProducao(rs.getString("producao"));
           lente.setPrecoCusto(rs.getDouble("preco_custo"));
           lente.setPrecoVenda(rs.getDouble("preco_venda"));
           lente.setPrecoMinimo(rs.getDouble("preco_minimo"));
           lente.setUnidade(rs.getString("unidade"));
           System.out.println("marcas  :" + lente.getMarca());
           System.out.println("Unidade :" + lente.getUnidade());
           lente.setTipoOlho(tipoOlho);
           lentes.add(lente);
		}
		return lentes;

	}
	
	
	
	

	// Método para formatar a string de busca
	private String formatarStringDeBusca(String busca) {
	    // Verificar se a string de busca contém apenas números e símbolos
	    if (busca.matches("[-+/*\\d]+")) {
	        // Usar regex para adicionar as vírgulas nos lugares apropriados
	        return busca.replaceAll("(-?\\d)(\\d{2})", "$1,$2");
	    } else {
	        // Retornar a busca sem modificação se não for numérica
	        return busca;
	    }
	}

    public boolean atualizarPrecoProdutoPorCodigo(String codigo, String campo, BigDecimal valor) { // Remova 'throws SQLException' temporariamente para capturar aqui
        String coluna;
        switch (campo) {
            case "custo": coluna = "preco_custo"; break;
            case "venda": coluna = "preco_venda"; break;
            case "minimo": coluna = "preco_minimo"; break;
            default: return false;
        }

        String sql = "UPDATE produtoteste SET " + coluna + " = ? WHERE idprodutoteste = ?";
        try (Connection conn = ConnectionFactory.getInstance().getConnection();
	             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setBigDecimal(1, valor);
            stmt.setString(2, codigo);
            int rowsAffected = stmt.executeUpdate(); // Captura o resultado
            System.out.println("DEBUG DAO: Query executada: " + sql);
            System.out.println("DEBUG DAO: Parâmetros: valor=" + valor + ", codigo=" + codigo);
            System.out.println("DEBUG DAO: Linhas afetadas: " + rowsAffected);
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("ERRO DAO: Falha ao atualizar preço. SQLState: " + e.getSQLState() + ", ErrorCode: " + e.getErrorCode());
            e.printStackTrace(); // Imprime o stack trace completo da exceção SQL
            return false;
        }
    }

    public boolean atualizarPrecoProduto(Long id, String campo, BigDecimal valor) throws SQLException {
        String coluna;
        switch (campo) {
            case "custo":
                coluna = "preco_custo";
                break;
            case "venda":
                coluna = "preco_venda";
                break;
            case "minimo":
                coluna = "preco_minimo";
                break;
            default:
                return false;
        }

        String sql = "UPDATE produtoteste SET " + coluna + " = ? WHERE idprodutoteste = ?";
        try (Connection conn = ConnectionFactory.getInstance().getConnection();
	             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setBigDecimal(1, valor);
            stmt.setLong(2, id);
            return stmt.executeUpdate() > 0;
        }
    }


   public void atualizarPrecos(List<Produto> produtos) throws SQLException {
        String sql = "UPDATE produtoteste SET preco_custo = ?, preco_venda = ? WHERE idprodutoteste = ?";

        try (Connection conn = ConnectionFactory.getInstance().getConnection();
             PreparedStatement statement = conn.prepareStatement(sql)) {

            for (Produto p : produtos) {
                statement.setDouble(1, p.getPrecoCusto());
                statement.setDouble(2, p.getPrecoVenda());
                statement.setLong(3, p.getId());
                statement.addBatch();
            }

            statement.executeBatch();
        }
    }
   private static final String SELECT_ALL = "SELECT * FROM produtoteste ORDER BY idprodutoteste DESC";
   
   
   private Lente mapearResultSetParaProduto(ResultSet resultSet) throws SQLException {
       Lente produto = new Lente();
       
       produto.setId(resultSet.getLong("idprodutoteste"));
       produto.setDescricao(resultSet.getString("descricao"));
       produto.setFabricante(resultSet.getString("fabricante"));
       produto.setModelo(resultSet.getString("modelo"));
       produto.setMaterial(resultSet.getString("material"));
       produto.setTipo(resultSet.getString("visao"));
       produto.setEsfIni(resultSet.getDouble("esf_ini"));
       produto.setEsfFim(resultSet.getDouble("esf_fim"));
       produto.setCilIni(resultSet.getDouble("cil_ini"));
       produto.setCilFim(resultSet.getDouble("cil_fim"));
       produto.setAdiIni(resultSet.getDouble("adi_ini"));
       produto.setAdiFim(resultSet.getDouble("adi_fim"));


       
       // NOVO: Anti-reflexo
       produto.setAntireflexo(resultSet.getString("antireflexo"));
       
     
       
       produto.setPrecoVenda(resultSet.getDouble("preco_venda"));
       produto.setPrecoCusto(resultSet.getDouble("preco_custo"));
       produto.setPrecoMinimo(resultSet.getDouble("preco_minimo"));

       return produto;
   }

   public List<Lente> buscarProdutosGeral(Long id, String fabricante, String marca, String tipo, String material,
           String codigo, BigDecimal precoMin, BigDecimal precoMax, Boolean ativo) throws SQLException {

StringBuilder sql = new StringBuilder("""
SELECT * 
FROM produtoteste 
WHERE 1=1
""");

if (id != null) sql.append(" AND idprodutoteste = ?");
if (fabricante != null && !fabricante.isEmpty()) sql.append(" AND fabricante LIKE ?");
if (marca != null && !marca.isEmpty()) sql.append(" AND modelo LIKE ?"); // modelo representa a marca
if (tipo != null && !tipo.isEmpty()) sql.append(" AND visao LIKE ?");
if (material != null && !material.isEmpty()) sql.append(" AND material LIKE ?");
if (codigo != null && !codigo.isEmpty()) sql.append(" AND codigo LIKE ?");
if (precoMin != null) sql.append(" AND preco_venda >= ?");
if (precoMax != null) sql.append(" AND preco_venda <= ?");

List<Lente> produtos = new ArrayList<>();
try (Connection conn = ConnectionFactory.getInstance().getConnection();
PreparedStatement stmt = conn.prepareStatement(sql.toString())) {

int index = 1;

if (id != null) stmt.setLong(index++, id);
if (fabricante != null && !fabricante.isEmpty()) stmt.setString(index++, "%" + fabricante + "%");
if (marca != null && !marca.isEmpty()) stmt.setString(index++, "%" + marca + "%");
if (tipo != null && !tipo.isEmpty()) stmt.setString(index++, "%" + tipo + "%");
if (material != null && !material.isEmpty()) stmt.setString(index++, "%" + material + "%");
if (codigo != null && !codigo.isEmpty()) stmt.setString(index++, "%" + codigo + "%");
if (precoMin != null) stmt.setBigDecimal(index++, precoMin);
if (precoMax != null) stmt.setBigDecimal(index++, precoMax);

try (ResultSet rs = stmt.executeQuery()) {
while (rs.next()) {
produtos.add(mapearResultSetParaProduto(rs));
}
}
}

return produtos;
}


   public List<Lente> listarTodos() throws SQLException {
       List<Lente> produtos = new ArrayList<>();
       
       try (Connection conn = ConnectionFactory.getInstance().getConnection();
            PreparedStatement statement = conn.prepareStatement(SELECT_ALL);
            ResultSet resultSet = statement.executeQuery()) {
           
           while (resultSet.next()) {
               produtos.add(mapearResultSetParaProduto(resultSet));
           }
       }
       
       return produtos;
   }

   public boolean cadastarVisaoSimplesSurf(Lente produto) {
	    final String sql = """
	        INSERT INTO produtoteste (
	            cod_prod_fornecedor, cod_web, marca, familia, fabricante,
	            diametro, indice, tipo, material, antireflexo,
	            ar_residual, tratamento, cor, adicao, altura_minima,
	            afinamento, antiblue, preco_custo, preco_venda, preco_minimo,
	            unidade, visao, esf_ini, esf_fim, cil_ini,
	            cil_fim, adi_ini, adi_fim, fotossensivel, producao
	        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	        """;

	 // ... sql igual ao seu ...

	    try (Connection cx = ConnectionFactory.getInstance().getConnection();
	         PreparedStatement stmt = cx.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

	        // 1-5
	        setNullableString(stmt, 1,  produto.getCodProdFornecedor());
	        setNullableString(stmt, 2,  produto.getCodigoWeb());
	        setNullableString(stmt, 3,  produto.getMarca());
	        setNullableString(stmt, 4,  produto.getFamilia());
	        setNullableString(stmt, 5,  produto.getFabricante());

	        // 6-10
	        setNullableString(stmt, 6,  safeToString(produto.getDiametro()));
	        setNullableDouble(stmt, 7,  produto.getIr());
	        setNullableString(stmt, 8,  produto.getTipo());
	        setNullableString(stmt, 9,  produto.getMaterial());
	        setNullableString(stmt, 10, produto.getAntireflexo());

	        // 11-13
	        setNullableString(stmt, 11, produto.getArResidual());
	        setNullableString(stmt, 12, produto.getTratamento());
	        setNullableString(stmt, 13, produto.getCor());

	        // 14-15  << sem parse se já for Double
	        setNullableDouble(stmt, 14, produto.getAdicao());
	        setNullableInt(stmt,    15, produto.getAlturaMinima());

	        // 16-20
	        setNullableString(stmt, 16, produto.getAfinamento());
	        setNullableString(stmt, 17, normalizeSimNao(produto.getAntiblue()));
	        setNullableDouble(stmt, 18, produto.getPrecoCusto());
	        setNullableDouble(stmt, 19, produto.getPrecoVenda());
	        setNullableDouble(stmt, 20, produto.getPrecoMinimo());

	        // 21-25
	        setNullableString(stmt, 21, produto.getUnidade());
	        setNullableString(stmt, 22, produto.getVisao());
	        setNullableDouble(stmt, 23, produto.getEsfIni());
	        setNullableDouble(stmt, 24, produto.getEsfFim());
	        setNullableDouble(stmt, 25, produto.getCilIni());

	        // 26-30
	        setNullableDouble(stmt, 26, produto.getCilFim());
	        setNullableDouble(stmt, 27, produto.getAdiIni());
	        setNullableDouble(stmt, 28, produto.getAdiFim());
	        setNullableString(stmt, 29, normalizeSimNao(produto.getFotossensivel()));
	        setNullableString(stmt, 30, produto.getTecnicaProducao());

	        int rows = stmt.executeUpdate();
	        if (rows > 0) {
	            try (ResultSet rs = stmt.getGeneratedKeys()) {
	                if (rs.next()) produto.setId(rs.getLong(1));
	            }
	            System.out.println("✅ Produto salvo: " + produto.getId() + " - " + produto.getMarca());
	            return true;
	        }
	    } catch (SQLException e) {
	        System.err.println("❌ Erro ao salvar produto: " + e.getMessage());
	        e.printStackTrace();
	    }
	    return false;

   }
	/* ===================== Helpers ===================== */

	private static void setNullableString(PreparedStatement stmt, int idx, String val) throws SQLException {
	    if (val == null || val.isBlank()) stmt.setNull(idx, java.sql.Types.VARCHAR);
	    else stmt.setString(idx, val.trim());
	}

	private static void setNullableDouble(PreparedStatement stmt, int idx, Double val) throws SQLException {
	    if (val == null) stmt.setNull(idx, java.sql.Types.DECIMAL);
	    else stmt.setDouble(idx, val);
	}

	private static void setNullableInt(PreparedStatement stmt, int idx, Integer val) throws SQLException {
	    if (val == null) stmt.setNull(idx, java.sql.Types.INTEGER);
	    else stmt.setInt(idx, val);
	}

	private static String safeToString(Object o) {
	    return (o == null) ? null : String.valueOf(o);
	}

	private static Double parseDoubleOrNull(String s) {
	    if (s == null) return null;
	    String v = s.trim().replace(',', '.');
	    if (v.isEmpty()) return null;
	    try { return Double.valueOf(v); } catch (NumberFormatException e) { return null; }
	}

	/** Normaliza variações para "Sim" / "Não" ou retorna null se vazio. */
	private static String normalizeSimNao(String v) {
	    if (v == null) return null;
	    String x = v.trim().toLowerCase();
	    if (x.isEmpty()) return null;
	    // positivos
	    if (x.equals("sim") || x.equals("s") || x.equals("true") || x.equals("1") || x.contains("yes")) return "Sim";
	    // negativos
	    if (x.equals("nao") || x.equals("não") || x.equals("n") || x.equals("false") || x.equals("0") || x.contains("no")) return "Não";
	    // qualquer outra string mantém (ex.: "BlueControl")
	    return v.trim();
	}


}