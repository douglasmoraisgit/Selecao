package br.com.vendas.auxiliares;



import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.text.NumberFormat;
import java.util.Locale;

public class ConverteLimita {
	
	
	private Double esf_ini;
	private Double esf_fim;
	private Double cil_ini;
	private Double cil_fim;


	public String convertePorChave(Double esf, Double cil) {
	    // Use o próprio grau recebido como chave de busca na faixa
	    this.esf_ini = esf;
	    this.esf_fim = esf;
	    this.cil_ini = cil;
	    this.cil_fim = cil;

	    NumberFormat nf = NumberFormat.getInstance(Locale.US);
	    nf.setMinimumFractionDigits(2);
	    nf.setMaximumFractionDigits(2);

	    String esfStr = nf.format(esf);
	    String cilStr = nf.format(cil);

	    String filtro = " ( " +
	        "LEAST(esf_ini, esf_fim) <= " + esfStr +
	        " AND GREATEST(esf_ini, esf_fim) >= " + esfStr +
	        " AND LEAST(cil_ini, cil_fim) <= " + cilStr +
	        " AND GREATEST(cil_ini, cil_fim) >= " + cilStr +
	        " ) ";

	    System.out.println("Faixa (surfacada) - Esf: " + esfStr + " Cil: " + cilStr);
	    System.out.println("Filtro faixa: " + filtro);

	    return filtro;
	}
	 /*	public String convertePorChave(Double esf,Double cil)
    {
		this.esf_ini = esf;
		this.esf_fim = esf;
		this.cil_ini = cil;
		this.cil_fim = cil;
		
    	if (esf >= 0 && cil >0)
    	{
    		double esferico = esf+cil;
    		double cilindrico = cil*-1;
    	
		        NumberFormat nf = NumberFormat.getInstance(Locale.US);
		        nf.setMinimumFractionDigits(2);
		        String esf_fim = String.valueOf(nf.format(esferico));
		        String esf_ini = String.valueOf(nf.format(esferico));
		        String cil_fim = String.valueOf(nf.format(cilindrico));
		        String cil_ini = String.valueOf(nf.format(cilindrico));
				
		     System.out.println("+ com +");
		     System.out.println("Grau digitado - Esferico  "+esf+"  Cilindrico  "+cil);
		     System.out.println("(esf_ini<=" +esf_ini+ " and esf_fim>="+esf_fim+" and cil_ini <="+cil_ini+" and cil_fim >="+cil_fim+")");
		        return " (esf_ini<=" +esf_ini+ " and esf_fim>="+esf_fim+" and cil_ini <="+cil_ini+" and cil_fim >="+cil_fim+")";
  	        
        }
    	else 
        {
    	if (esf <= 0 && cil <0)
    	{
    		double esferico = esf+cil;
    	    double cilindrico = cil*-1;
    	    
    	    NumberFormat nf = NumberFormat.getInstance(Locale.US);
	        nf.setMinimumFractionDigits(2);
	        String esf_fim = String.valueOf(nf.format(esferico));
	        String esf_ini = String.valueOf(nf.format(esferico));
	        String cil_fim = String.valueOf(nf.format(cilindrico));
	        String cil_ini = String.valueOf(nf.format(cilindrico));
	        
	        System.out.println("- com -");
	        System.out.println("Grau digitado - Esferico  "+esf+"  Cilindrico  "+cil);
	        System.out.println("(esf_ini<=" +esf_ini+ " and esf_fim>="+esf_fim+" and cil_ini <="+cil_ini+" and cil_fim >="+cil_fim+")");
	        return "(esf_ini<=" +esf_ini+ " and esf_fim>="+esf_fim+" and cil_ini <="+cil_ini+" and cil_fim >="+cil_fim+")";
    	}else
    		
    		System.out.println("+ com -  OU  - com +");
    	    System.out.println("Grau digitado - Esferico  "+esf+"  Cilindrico  "+cil);
    	    System.out.println("(esf_ini<=" +esf_ini+ " and esf_fim>="+esf_fim+" and cil_ini <="+cil_ini+" and cil_fim >="+cil_fim+")");
    		return "(esf_ini<=" +esf_ini+ " and esf_fim>="+esf_fim+" and cil_ini <="+cil_ini+" and cil_fim >="+cil_fim+")";
    		 
        
    }
    	
    }*/
	/*public String converteMultifocal(Double esf, Double cil, Double adi) {
	    this.esf_ini = esf;
        this.cil_ini = cil;
        
        double esferico = 0;
        double cilindrico = 0;
        String descricaoTransposicao = "";

        if (esf_ini > 0 && cil_ini > 0) { // + com +
            esferico = esf_ini + cil_ini;
            cilindrico = cil_ini * -1;
            descricaoTransposicao = "+ com + transposto para + com -";
            System.out.println("-------------------------------------------------");
        } else if (esf_ini < 0 && cil_ini > 0) { // - com +
            esferico = esf_ini + cil_ini;
            cilindrico = cil_ini * -1;
            descricaoTransposicao = "- com + transposto para - com -";
            System.out.println("-------------------------------------------------");
      } else if (esf_ini == 0 && cil_ini > 0) { // plano com +
            esferico = esf_ini + cil_ini;
            cilindrico = cil_ini * -1;
            descricaoTransposicao = "plano com + transposto para - com -";
            System.out.println("-------------------------------------------------"); 
  
        } else {
            esferico = esf_ini;
            cilindrico = cil_ini;
            descricaoTransposicao = "sem transposição necessária";
        }

        // Formatação para duas casas decimais com ponto decimal (padrão SQL)
        DecimalFormat df = new DecimalFormat("0.00", new DecimalFormatSymbols(Locale.US));
        String esfStr = df.format(esferico);
        String cilStr = df.format(cilindrico);
        String adiStr = (adi != null) ? df.format(adi) : "NULL";

        // Monta a string SQL para verificar disponibilidade
        String sql = "(esf_ini <= " + esfStr + " AND esf_fim >= " + esfStr + 
                     " AND cil_ini <= " + cilStr + " AND cil_fim >= " + cilStr;

        // Adiciona a condição da adição apenas se adi for diferente de null
        if (adi != null) {
            sql += " AND adi_ini <= " + adiStr + " AND adi_fim >= " + adiStr;
        }
        
        sql += ")";

        System.out.println("Grau digitado - Esférico: " + esf + " | Cilíndrico: " + cil + " | Adição: " + adi);
        System.out.println("Consulta SQL gerada: " + sql);

        return sql;
    }
    */
	public String converteMultifocal(Double esf, Double cil, Double adi) {
	    this.esf_ini = esf;
	    this.cil_ini = cil;
	    
	    double esferico;
	    double cilindrico;
	    String descricaoTransposicao = "";

	    if (esf_ini > 0 && cil_ini > 0) { // + com +
	        esferico = esf_ini + cil_ini;
	        cilindrico = cil_ini * -1;
	        descricaoTransposicao = "+ com + transposto para + com -";
	        System.out.println("-------------------------------------------------");
	    } else if (esf_ini < 0 && cil_ini > 0) { // - com +
	        esferico = esf_ini + cil_ini;
	        cilindrico = cil_ini * -1;
	        descricaoTransposicao = "- com + transposto para - com -";
	        System.out.println("-------------------------------------------------");
	    } else if (esf_ini == 0 && cil_ini > 0) { // plano com +
	        esferico = esf_ini + cil_ini;
	        cilindrico = cil_ini * -1;
	        descricaoTransposicao = "plano com + transposto para - com -";
	        System.out.println("-------------------------------------------------"); 
	    } else {
	        esferico = esf_ini;
	        cilindrico = cil_ini;
	        descricaoTransposicao = "sem transposição necessária";
	    }

	    // Formatação para duas casas decimais com ponto decimal (padrão SQL)
	    DecimalFormat df = new DecimalFormat("0.00", new DecimalFormatSymbols(Locale.US));
	    String esfStr = df.format(esferico);
	    String cilStr = df.format(cilindrico);
	    String adiStr = (adi != null) ? df.format(adi) : null;

	    // Monta a string SQL usando LEAST/GREATEST para suportar faixas invertidas
	    StringBuilder sql = new StringBuilder();

	    sql.append("(")
	       .append("LEAST(esf_ini, esf_fim) <= ").append(esfStr)
	       .append(" AND GREATEST(esf_ini, esf_fim) >= ").append(esfStr)
	       .append(" AND LEAST(cil_ini, cil_fim) <= ").append(cilStr)
	       .append(" AND GREATEST(cil_ini, cil_fim) >= ").append(cilStr);

	    // Adiciona a condição da adição apenas se adi for diferente de null
	    if (adiStr != null) {
	        sql.append(" AND LEAST(adi_ini, adi_fim) <= ").append(adiStr)
	           .append(" AND GREATEST(adi_ini, adi_fim) >= ").append(adiStr);
	    }
	    
	    sql.append(")");

	    System.out.println(descricaoTransposicao);
	    System.out.println("Grau digitado - Esférico: " + esf + 
	                       " | Cilíndrico: " + cil + 
	                       " | Adição: " + adi);
	    System.out.println("Consulta SQL gerada (MULTI): " + sql);

	    return sql.toString();
	}

	 public String converteGrau(Double esf, Double cil) {
	        this.esf_ini = esf;
	        this.cil_ini = cil;
	        
	        double esferico = 0;
	        double cilindrico = 0;
	        String descricaoTransposicao = "";

	        if (esf_ini > 0 && cil_ini > 0) { // + com +
	            esferico = esf_ini + cil_ini;
	            cilindrico = cil_ini * -1;
	            descricaoTransposicao = "+ com + transposto para + com -";
	            System.out.println("-------------------------------------------------");
	        } else if (esf_ini < 0 && cil_ini > 0) { // - com +
	            esferico = esf_ini + cil_ini;
	            cilindrico = cil_ini * -1;
	            descricaoTransposicao = "- com + transposto para - com -";
	            System.out.println("-------------------------------------------------");
	      } else if (esf_ini == 0 && cil_ini > 0) { // plano com +
	            esferico = esf_ini + cil_ini;
	            cilindrico = cil_ini * -1;
	            descricaoTransposicao = "plano com + transposto para - com -";
	            System.out.println("-------------------------------------------------"); 
	   /*     } else if (esf_ini == 0 && cil_ini < 0) { // plano com -
	            esferico = esf_ini - cil_ini;
	            cilindrico = cil_ini * -1;
	            descricaoTransposicao = "plano com - transposto para + com +";
	            System.out.println("-------------------------------------------------"); */
	        } else {
	            esferico = esf_ini;
	            cilindrico = cil_ini;
	            descricaoTransposicao = "sem transposição necessária";
	        }

	        NumberFormat nf = NumberFormat.getInstance(Locale.US);
	        nf.setMinimumFractionDigits(2);
	        nf.setMaximumFractionDigits(2);

	        String esf_formatado = nf.format(esferico);
	        String cil_formatado = nf.format(cilindrico);

	        System.out.println(descricaoTransposicao);
	        System.out.println("Grau digitado - Esférico: " + esf + " Cilíndrico: " + cil);
	        System.out.println("Transposição - Esférico: " + esferico + " Cilíndrico: " + cilindrico);

	        return "(esferico=" + esf_formatado + " and cilindrico=" + cil_formatado + ")";
	    }
	public String converteBifocal(Double esf, Double cil, Double adi) {
        double esferico = esf;
        double cilindrico = cil;

        // Normaliza graus positivos e negativos
        if (esf > 0 && cil > 0) { // + com +
            esferico = esf + cil;
            cilindrico = cil * -1;
        }else if (esf < 0 && cil> 0) { // - com +
        	esferico = esf + cil;
            cilindrico = cil * -1;
        }else if (esf== 0 && cil > 0) { // plano com +
        	esferico = esf + cil;
            cilindrico = cil* -1;
        }else {
            esferico = esf;
            cilindrico = cil;
        }

        // Formatação para duas casas decimais com ponto decimal (padrão SQL)
        DecimalFormat df = new DecimalFormat("0.00", new DecimalFormatSymbols(Locale.US));
        String esfStr = df.format(esferico);
        String cilStr = df.format(cilindrico);
        String adiStr = (adi != null) ? df.format(adi) : "NULL";

        // Monta a string SQL para verificar disponibilidade
        String sql = "(esf_ini <= " + esfStr + " AND esf_fim >= " + esfStr + 
                     " AND cil_ini <= " + cilStr + " AND cil_fim >= " + cilStr;

        // Adiciona a condição da adição apenas se adi for diferente de null
        if (adi != null) {
            sql += " AND adi_ini <= " + adiStr + " AND adi_fim >= " + adiStr;
        }
        
        sql += ")";

        System.out.println("Grau digitado - Esférico: " + esf + " | Cilíndrico: " + cil + " | Adição: " + adi);
        System.out.println("Consulta SQL gerada: " + sql);

        return sql;
    }
	public String converteMultifocalPorLimite(Double esf, Double cil, Double adi) {
	    // Aplica transposição se necessário
	    double esferico = esf;
	    double cilindrico = cil;

	    if (esf > 0 && cil > 0) {
	        esferico = esf + cil;
	        cilindrico = cil * -1;
	    } else if (esf < 0 && cil > 0) {
	        esferico = esf + cil;
	        cilindrico = cil * -1;
	    } else if (esf == 0 && cil > 0) {
	        esferico = esf + cil;
	        cilindrico = cil * -1;
	    }

	    // Formata os valores finais
	    DecimalFormat df = new DecimalFormat("0.00", new DecimalFormatSymbols(Locale.US));
	    String esfStr = df.format(esferico);
	    String cilStr = df.format(Math.abs(cilindrico)); // sempre módulo
	    String adiStr = (adi != null) ? df.format(adi) : null;

	    // Monta SQL
	    StringBuilder sql = new StringBuilder();
	    sql.append("(")
	       .append(esfStr).append(" <= esferico")
	       .append(" AND ").append(cilStr).append(" <= ABS(cilindrico)");

	    if (adiStr != null) {
	        sql.append(" AND ").append(adiStr).append(" <= adicao");
	    }

	    sql.append(")");

	    System.out.println("Nova consulta por limites máximos:");
	    System.out.println("Transposto: ESF=" + esferico + " | CIL=" + cilindrico + " | ADD=" + adi);
	    System.out.println("Consulta SQL: " + sql.toString());


	    return sql.toString();
	}


   
    
    public String montaFiltroGrau(Float rod_esf, Float rod_cil, Float rod_eixo, Float roe_esf, Float roe_cil, Float roe_eixo, Float adicao) {
        StringBuilder filter = new StringBuilder();
        boolean hasFilter = false;

        // Tolerância para graus (ex.: ±0.25 para esferico e cilindrico)
        float tolerance = 0.25f;
        float eixoTolerance = 5.0f; // Tolerância para eixo

        // Filtro para olho direito (OD)
        if (rod_esf != null || rod_cil != null || rod_eixo != null) {
            filter.append("(");
            if (rod_esf != null) {
                filter.append("esferico BETWEEN ").append(rod_esf - tolerance).append(" AND ").append(rod_esf + tolerance);
                hasFilter = true;
            }
            if (rod_cil != null) {
                if (hasFilter) filter.append(" AND ");
                filter.append("cilindrico BETWEEN ").append(rod_cil - tolerance).append(" AND ").append(rod_cil + tolerance);
                hasFilter = true;
            }
        /*    if (rod_eixo != null && rod_cil != null) { // Eixo só é relevante se houver cilindrico
                if (hasFilter) filter.append(" AND ");
                filter.append("eixo BETWEEN ").append(rod_eixo - eixoTolerance).append(" AND ").append(rod_eixo + eixoTolerance);
                hasFilter = true;
            }
            */
            filter.append(")");
        }

        // Filtro para olho esquerdo (OE)
        if (roe_esf != null || roe_cil != null || roe_eixo != null) {
            if (hasFilter) filter.append(" OR ");
            filter.append("(");
            hasFilter = false;
            if (roe_esf != null) {
                filter.append("esferico BETWEEN ").append(roe_esf - tolerance).append(" AND ").append(roe_esf + tolerance);
                hasFilter = true;
            }
            if (roe_cil != null) {
                if (hasFilter) filter.append(" AND ");
                filter.append("cilindrico BETWEEN ").append(roe_cil - tolerance).append(" AND ").append(roe_cil + tolerance);
                hasFilter = true;
            }
         /*   if (roe_eixo != null && roe_cil != null) {
                if (hasFilter) filter.append(" AND ");
                filter.append("eixo BETWEEN ").append(roe_eixo - eixoTolerance).append(" AND ").append(roe_eixo + eixoTolerance);
                hasFilter = true;
            }
            */
            filter.append(")");
        }

        // Filtro para adição
        if (adicao != null) {
            if (hasFilter) filter.append(" AND ");
            filter.append("adicao BETWEEN ").append(adicao - tolerance).append(" AND ").append(adicao + tolerance);
            hasFilter = true;
        }

        // Log do filtro gerado
        System.out.println("grauFilter gerado: " + (hasFilter ? filter.toString() : "null"));

        return hasFilter ? filter.toString() : null;
    }
    /**
     * Monta um filtro que retorna:
     * - Lentes prontas: esferico / cilindrico exatos
     * - Lentes surfaçadas: faixas esf_ini/esf_fim, cil_ini/cil_fim compatíveis
     */
    public String converteFiltroCompleto(Double esf, Double cil) {

        // 1) Filtro de igualdade (lentes prontas)
        String filtroIgualdade = converteGrau(esf, cil); 
        // ex: (esferico=1.00 and cilindrico=-1.00)

        // 2) Filtro de faixa (lentes surfaçadas)
        String filtroFaixa = convertePorChave(esf, cil); 
        // ex: (esf_ini<=1.00 and esf_fim>=1.00 and cil_ini<=-1.00 and cil_fim>=-1.00)

        // 3) Combina tudo
        return " ( " + filtroIgualdade + " AND " + filtroFaixa + " ) ";
    }
   
    }

