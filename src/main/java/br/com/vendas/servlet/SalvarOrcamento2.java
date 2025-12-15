package br.com.vendas.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import br.com.vendas.dao.ConnectionFactory;
import br.com.vendas.util.GsonUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * SalvarOrcamento.java
 * Servlet para salvar orçamentos do sistema MVC
 * 
 * RECEBE:
 * - lentes: JSON array com as lentes selecionadas
 * - produtos: JSON array com os produtos selecionados
 * - cliente_id: ID do cliente (opcional)
 * - cliente_nome: Nome do cliente
 * - total: Valor total do orçamento
 * - tipo: "orcamento" (para diferenciar de pedido)
 * 
 * RESPONDE:
 * - JSON com { success: boolean, message: string, orcamentoId?: number }
 * 
 * @author OptoFreela
 */
public class SalvarOrcamento2 extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    // Usa GsonUtils para compatibilidade com LocalDate/LocalDateTime
    private Gson gson = GsonUtils.getGson();
    
    // Parser para versões antigas do Gson (antes da 2.8.6)
    @SuppressWarnings("deprecation")
    private JsonParser jsonParser = new JsonParser();

    public SalvarOrcamento2() {
        super();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        JsonObject resultado = new JsonObject();
        
        try {
            // ========================================
            // 1. RECUPERA DADOS DO REQUEST
            // ========================================
            
            String clienteId = request.getParameter("cliente_id");
            String clienteNome = request.getParameter("cliente_nome");
            String lentesJson = request.getParameter("lentes");
            String produtosJson = request.getParameter("produtos");
            String totalStr = request.getParameter("total");
            
            System.out.println("╔════════════════════════════════════════════════════════════════╗");
            System.out.println("║  💾 SALVANDO ORÇAMENTO                                         ║");
            System.out.println("╚════════════════════════════════════════════════════════════════╝");
            System.out.println("Cliente: " + clienteNome + " (ID: " + clienteId + ")");
            System.out.println("Total: " + totalStr);
            
            // ========================================
            // 2. PROCESSA LENTES
            // ========================================
            
            List<ItemOrcamento> lentes = new ArrayList<>();
            
            if (lentesJson != null && !lentesJson.isEmpty()) {
                @SuppressWarnings("deprecation")
                JsonArray lentesArray = jsonParser.parse(lentesJson).getAsJsonArray();
                
                for (JsonElement element : lentesArray) {
                    JsonObject lenteObj = element.getAsJsonObject();
                    ItemOrcamento item = processarLente(lenteObj);
                    lentes.add(item);
                    
                    System.out.println("  📦 Lente: " + item.descricao);
                }
            }
            
            System.out.println("Total de lentes: " + lentes.size());
            
            // ========================================
            // 3. PROCESSA PRODUTOS
            // ========================================
            
            List<ItemOrcamento> produtos = new ArrayList<>();
            
            if (produtosJson != null && !produtosJson.isEmpty()) {
                @SuppressWarnings("deprecation")
                JsonArray produtosArray = jsonParser.parse(produtosJson).getAsJsonArray();
                
                for (JsonElement element : produtosArray) {
                    JsonObject produtoObj = element.getAsJsonObject();
                    ItemOrcamento item = processarProduto(produtoObj);
                    produtos.add(item);
                    
                    System.out.println("  📦 Produto: " + item.descricao);
                }
            }
            
            System.out.println("Total de produtos: " + produtos.size());
            
            // ========================================
            // 4. CRIA OBJETO ORÇAMENTO
            // ========================================
            
            Orcamento orcamento = new Orcamento();
            orcamento.clienteId = clienteId != null && !clienteId.isEmpty() ? Long.parseLong(clienteId) : null;
            orcamento.clienteNome = clienteNome;
            orcamento.lentes = lentes;
            orcamento.produtos = produtos;
            orcamento.total = totalStr != null ? Double.parseDouble(totalStr) : 0.0;
            orcamento.dataHora = LocalDateTime.now();
            orcamento.status = "PENDENTE";
            
            // ========================================
            // 5. SALVA NO BANCO DE DADOS
            // ========================================
            
            Long orcamentoId = salvarNoBanco(orcamento, lentes, produtos);
            
            if (orcamentoId == null) {
                throw new Exception("Falha ao salvar orçamento no banco");
            }
            
            System.out.println("✅ Orçamento salvo! ID: " + orcamentoId);
            
            // ========================================
            // 6. RETORNA SUCESSO
            // ========================================
            
            resultado.addProperty("success", true);
            resultado.addProperty("message", "Orçamento salvo com sucesso!");
            resultado.addProperty("orcamentoId", orcamentoId);
            resultado.addProperty("quantidadeLentes", lentes.size());
            resultado.addProperty("quantidadeProdutos", produtos.size());
            resultado.addProperty("total", orcamento.total);
            
        } catch (Exception e) {
            System.err.println("❌ Erro ao salvar orçamento: " + e.getMessage());
            e.printStackTrace();
            
            resultado.addProperty("success", false);
            resultado.addProperty("message", "Erro ao salvar orçamento: " + e.getMessage());
        }
        
        out.print(gson.toJson(resultado));
        out.flush();
    }

    /**
     * Processa uma lente do JSON
     */
    private ItemOrcamento processarLente(JsonObject obj) {
        ItemOrcamento item = new ItemOrcamento();
        
        item.id = getStringSeguro(obj, "id");
        item.tipo = "lente";
        item.codigo = getIntSeguro(obj, "codigo");
        item.codigoWeb = getStringSeguro(obj, "codigoWeb");
        item.marca = getStringSeguro(obj, "marca");
        item.familia = getStringSeguro(obj, "familia");
        item.descricao = getStringSeguro(obj, "descricao");
        item.olho = getStringSeguro(obj, "olho");
        item.esf = getDoubleSeguro(obj, "esf");
        item.cil = getDoubleSeguro(obj, "cil");
        item.eixo = getIntSeguro(obj, "eixo");
        item.adicao = getDoubleSeguro(obj, "adicao");
        item.unidade = getStringSeguro(obj, "unidade");
        item.quantidade = getDoubleSeguro(obj, "quantidade");
        item.precoUnitario = getDoubleSeguro(obj, "precoUnitario");
        item.precoTotal = getDoubleSeguro(obj, "precoTotal");
        
        // Processa tratamentos
        if (obj.has("tratamentos") && obj.get("tratamentos").isJsonArray()) {
            item.tratamentos = new ArrayList<>();
            JsonArray tratamentosArray = obj.getAsJsonArray("tratamentos");
            
            for (JsonElement element : tratamentosArray) {
                JsonObject tratObj = element.getAsJsonObject();
                Tratamento tratamento = new Tratamento();
                tratamento.codigo = getIntSeguro(tratObj, "codigo");
                tratamento.nome = getStringSeguro(tratObj, "nome");
                tratamento.valor = getDoubleSeguro(tratObj, "valor");
                item.tratamentos.add(tratamento);
            }
        }
        
        // Processa coloração
        if (obj.has("coloracao") && !obj.get("coloracao").isJsonNull()) {
            JsonObject corObj = obj.getAsJsonObject("coloracao");
            item.coloracao = new Coloracao();
            item.coloracao.nome = getStringSeguro(corObj, "nome");
            item.coloracao.tipo = getStringSeguro(corObj, "tipo");
            item.coloracao.valor = getDoubleSeguro(corObj, "valor");
            item.coloracao.hex = getStringSeguro(corObj, "hex");
        }
        
        return item;
    }

    /**
     * Processa um produto do JSON
     */
    private ItemOrcamento processarProduto(JsonObject obj) {
        ItemOrcamento item = new ItemOrcamento();
        
        item.id = getStringSeguro(obj, "id");
        item.tipo = "produto";
        item.codigo = getIntSeguro(obj, "codigo");
        item.descricao = getStringSeguro(obj, "descricao");
        item.marca = getStringSeguro(obj, "marca");
        item.unidade = getStringSeguro(obj, "unidade");
        item.quantidade = getDoubleSeguro(obj, "quantidade");
        item.precoUnitario = getDoubleSeguro(obj, "precoUnitario");
        item.precoTotal = item.precoUnitario * item.quantidade;
        
        return item;
    }

    // ========================================
    // HELPERS
    // ========================================

    private String getStringSeguro(JsonObject obj, String key) {
        if (obj.has(key) && !obj.get(key).isJsonNull()) {
            return obj.get(key).getAsString();
        }
        return "";
    }

    private int getIntSeguro(JsonObject obj, String key) {
        if (obj.has(key) && !obj.get(key).isJsonNull()) {
            try {
                return obj.get(key).getAsInt();
            } catch (Exception e) {
                return 0;
            }
        }
        return 0;
    }

    private double getDoubleSeguro(JsonObject obj, String key) {
        if (obj.has(key) && !obj.get(key).isJsonNull()) {
            try {
                return obj.get(key).getAsDouble();
            } catch (Exception e) {
                return 0.0;
            }
        }
        return 0.0;
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Redireciona GET para POST
        doPost(request, response);
    }

    // ========================================
    // PERSISTÊNCIA NO BANCO
    // ========================================

    /**
     * Salva orçamento e itens no banco de dados
     */
    private Long salvarNoBanco(Orcamento orcamento, List<ItemOrcamento> lentes, List<ItemOrcamento> produtos) {
        Connection conn = null;
        PreparedStatement stmtOrcamento = null;
        PreparedStatement stmtItem = null;
        ResultSet rs = null;
        
        try {
            conn = ConnectionFactory.getInstance().getConnection();
            conn.setAutoCommit(false);
            
            // 1. Insere orçamento principal
            String sqlOrcamento = 
                "INSERT INTO orcamentos (cliente_id, cliente_nome, total, status, data_hora) " +
                "VALUES (?, ?, ?, ?, NOW())";
            
            stmtOrcamento = conn.prepareStatement(sqlOrcamento, Statement.RETURN_GENERATED_KEYS);
            stmtOrcamento.setObject(1, orcamento.clienteId);
            stmtOrcamento.setString(2, orcamento.clienteNome);
            stmtOrcamento.setDouble(3, orcamento.total);
            stmtOrcamento.setString(4, "PENDENTE");
            
            stmtOrcamento.executeUpdate();
            
            // Recupera ID gerado
            rs = stmtOrcamento.getGeneratedKeys();
            if (!rs.next()) {
                throw new Exception("Não foi possível obter ID do orçamento");
            }
            Long orcamentoId = rs.getLong(1);
            
            // 2. Insere itens (lentes)
            String sqlItem = 
                "INSERT INTO orcamento_itens " +
                "(orcamento_id, item_id, tipo, codigo, codigo_web, marca, familia, descricao, " +
                " olho, esf, cil, eixo, adicao, unidade, quantidade, preco_unitario, preco_total, " +
                " tratamentos_json, coloracao_json) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            stmtItem = conn.prepareStatement(sqlItem);
            
            for (ItemOrcamento item : lentes) {
                stmtItem.setLong(1, orcamentoId);
                stmtItem.setString(2, item.id);
                stmtItem.setString(3, "lente");
                stmtItem.setInt(4, item.codigo);
                stmtItem.setString(5, item.codigoWeb);
                stmtItem.setString(6, item.marca);
                stmtItem.setString(7, item.familia);
                stmtItem.setString(8, item.descricao);
                stmtItem.setString(9, item.olho);
                stmtItem.setDouble(10, item.esf);
                stmtItem.setDouble(11, item.cil);
                stmtItem.setInt(12, item.eixo);
                stmtItem.setDouble(13, item.adicao);
                stmtItem.setString(14, item.unidade);
                stmtItem.setDouble(15, item.quantidade);
                stmtItem.setDouble(16, item.precoUnitario);
                stmtItem.setDouble(17, item.precoTotal);
                stmtItem.setString(18, item.tratamentos != null ? gson.toJson(item.tratamentos) : null);
                stmtItem.setString(19, item.coloracao != null ? gson.toJson(item.coloracao) : null);
                
                stmtItem.addBatch();
            }
            
            // 3. Insere itens (produtos)
            for (ItemOrcamento item : produtos) {
                stmtItem.setLong(1, orcamentoId);
                stmtItem.setString(2, item.id);
                stmtItem.setString(3, "produto");
                stmtItem.setInt(4, item.codigo);
                stmtItem.setString(5, null);
                stmtItem.setString(6, item.marca);
                stmtItem.setString(7, null);
                stmtItem.setString(8, item.descricao);
                stmtItem.setString(9, null);
                stmtItem.setDouble(10, 0);
                stmtItem.setDouble(11, 0);
                stmtItem.setInt(12, 0);
                stmtItem.setDouble(13, 0);
                stmtItem.setString(14, item.unidade);
                stmtItem.setDouble(15, item.quantidade);
                stmtItem.setDouble(16, item.precoUnitario);
                stmtItem.setDouble(17, item.precoTotal);
                stmtItem.setString(18, null);
                stmtItem.setString(19, null);
                
                stmtItem.addBatch();
            }
            
            stmtItem.executeBatch();
            
            // Commit
            conn.commit();
            
            return orcamentoId;
            
        } catch (Exception e) {
            System.err.println("❌ Erro ao salvar no banco: " + e.getMessage());
            e.printStackTrace();
            
            // Rollback
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }
            
            return null;
            
        } finally {
            try {
                if (rs != null) rs.close();
                if (stmtItem != null) stmtItem.close();
                if (stmtOrcamento != null) stmtOrcamento.close();
                if (conn != null) {
                    conn.setAutoCommit(true);
                    conn.close();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    // ========================================
    // CLASSES INTERNAS
    // ========================================

    /**
     * Representa um orçamento
     */
    public static class Orcamento implements java.io.Serializable {
        private static final long serialVersionUID = 1L;
        
        public Long id;
        public Long clienteId;
        public String clienteNome;
        public List<ItemOrcamento> lentes;
        public List<ItemOrcamento> produtos;
        public double total;
        public LocalDateTime dataHora;
        public String status; // PENDENTE, CONVERTIDO, EXPIRADO
    }

    /**
     * Representa um item do orçamento
     */
    public static class ItemOrcamento implements java.io.Serializable {
        private static final long serialVersionUID = 1L;
        
        public String id;
        public String tipo;
        public int codigo;
        public String codigoWeb;
        public String marca;
        public String familia;
        public String descricao;
        public String olho;
        public double esf;
        public double cil;
        public int eixo;
        public double adicao;
        public String unidade;
        public double quantidade;
        public double precoUnitario;
        public double precoTotal;
        public List<Tratamento> tratamentos;
        public Coloracao coloracao;
    }

    /**
     * Representa um tratamento
     */
    public static class Tratamento implements java.io.Serializable {
        private static final long serialVersionUID = 1L;
        
        public int codigo;
        public String nome;
        public double valor;
    }

    /**
     * Representa uma coloração
     */
    public static class Coloracao implements java.io.Serializable {
        private static final long serialVersionUID = 1L;
        
        public String nome;
        public String tipo;
        public double valor;
        public String hex;
    }
}
