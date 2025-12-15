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
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * SalvarOrcamento.java
 * Servlet para salvar orçamentos do sistema MVC
 * 
 * ✅ ATUALIZADO: Agora usa dados do usuário logado da sessão
 * 
 * DADOS DA SESSÃO UTILIZADOS:
 * - usuarioId: ID do usuário que está criando o orçamento
 * - usuarioNome: Nome do vendedor
 * - lojaId: ID da loja do usuário
 * 
 * @author OptoFreela
 */
public class SalvarOrcamento extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private Gson gson = GsonUtils.getGson();
    
    @SuppressWarnings("deprecation")
    private JsonParser jsonParser = new JsonParser();

    public SalvarOrcamento() {
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
            // ✅ NOVO: Obtém dados do usuário da sessão
            HttpSession session = request.getSession(false);
            if (session == null) {
                throw new Exception("Sessão inválida. Faça login novamente.");
            }
            
            Integer usuarioId = (Integer) session.getAttribute("usuarioId");
            String usuarioNome = (String) session.getAttribute("usuarioNome");
            Integer lojaId = (Integer) session.getAttribute("lojaId");
            
            if (usuarioId == null) {
                throw new Exception("Usuário não autenticado. Faça login novamente.");
            }
            
            // ========================================
            // 1. RECUPERA DADOS DO REQUEST
            // ========================================
            
            String clienteId = request.getParameter("cliente_id");
            String clienteNome = request.getParameter("cliente_nome");
            String lentesJson = request.getParameter("lentes");
            String produtosJson = request.getParameter("produtos");
            String totalStr = request.getParameter("total");
            
            if (clienteNome == null || clienteNome.trim().isEmpty()) {
                clienteNome = "Cliente não informado";
            }
            
            System.out.println("╔════════════════════════════════════════════════════════════════╗");
            System.out.println("║  💾 SALVANDO ORÇAMENTO                                         ║");
            System.out.println("╠════════════════════════════════════════════════════════════════╣");
            System.out.println("║  👤 Usuário: " + usuarioNome + " (ID: " + usuarioId + ")");
            System.out.println("║  🏪 Loja ID: " + lojaId);
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
            orcamento.usuarioId = usuarioId;      // ✅ NOVO
            orcamento.usuarioNome = usuarioNome;  // ✅ NOVO
            orcamento.lojaId = lojaId;            // ✅ NOVO
            
            // ========================================
            // 5. SALVA NO BANCO DE DADOS
            // ========================================
            
            Long orcamentoId = salvarNoBanco(orcamento, lentes, produtos);
            
            if (orcamentoId == null) {
                throw new Exception("Falha ao salvar orçamento no banco");
            }
            
            System.out.println("✅ Orçamento salvo! ID: " + orcamentoId);
            System.out.println("   Vendedor: " + usuarioNome + " | Loja: " + lojaId);
            
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
            JsonArray tratamentosArray = obj.get("tratamentos").getAsJsonArray();
            for (JsonElement elem : tratamentosArray) {
                JsonObject tratObj = elem.getAsJsonObject();
                Tratamento trat = new Tratamento();
                trat.codigo = getIntSeguro(tratObj, "codigo");
                trat.nome = getStringSeguro(tratObj, "nome");
                trat.valor = getDoubleSeguro(tratObj, "valor");
                item.tratamentos.add(trat);
            }
        }
        
        // Processa coloração
        if (obj.has("coloracao") && obj.get("coloracao").isJsonObject()) {
            JsonObject corObj = obj.get("coloracao").getAsJsonObject();
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
        item.marca = getStringSeguro(obj, "marca");
        item.descricao = getStringSeguro(obj, "descricao");
        item.unidade = getStringSeguro(obj, "unidade");
        item.quantidade = getDoubleSeguro(obj, "quantidade");
        item.precoUnitario = getDoubleSeguro(obj, "precoUnitario");
        item.precoTotal = getDoubleSeguro(obj, "precoTotal");
        
        return item;
    }

    // Métodos auxiliares para leitura segura de JSON
    private String getStringSeguro(JsonObject obj, String key) {
        if (obj.has(key) && !obj.get(key).isJsonNull()) {
            return obj.get(key).getAsString();
        }
        return null;
    }
    
    private int getIntSeguro(JsonObject obj, String key) {
        if (obj.has(key) && !obj.get(key).isJsonNull()) {
            return obj.get(key).getAsInt();
        }
        return 0;
    }
    
    private double getDoubleSeguro(JsonObject obj, String key) {
        if (obj.has(key) && !obj.get(key).isJsonNull()) {
            return obj.get(key).getAsDouble();
        }
        return 0.0;
    }

    // ========================================
    // PERSISTÊNCIA NO BANCO
    // ========================================

    /**
     * Salva orçamento e itens no banco de dados
     * ✅ ATUALIZADO: Agora salva id_usuario, vendedor e id_loja
     */
    private Long salvarNoBanco(Orcamento orcamento, List<ItemOrcamento> lentes, List<ItemOrcamento> produtos) {
        Connection conn = null;
        PreparedStatement stmtOrcamento = null;
        PreparedStatement stmtItem = null;
        ResultSet rs = null;
        
        try {
            conn = ConnectionFactory.getInstance().getConnection();
            conn.setAutoCommit(false);
            
            // 1. Insere orçamento principal - ✅ ATUALIZADO com campos de usuário
            // Usa vendedor_id (campo existente na tabela)
            String sqlOrcamento = 
                "INSERT INTO orcamentos (cliente_id, cliente_nome, total, status, data_hora, " +
                "vendedor_id, id_loja, vendedor) " +
                "VALUES (?, ?, ?, ?, NOW(), ?, ?, ?)";
            
            stmtOrcamento = conn.prepareStatement(sqlOrcamento, Statement.RETURN_GENERATED_KEYS);
            stmtOrcamento.setObject(1, orcamento.clienteId);
            stmtOrcamento.setString(2, orcamento.clienteNome);
            stmtOrcamento.setDouble(3, orcamento.total);
            stmtOrcamento.setString(4, "PENDENTE");
            stmtOrcamento.setObject(5, orcamento.usuarioId);    // ✅ vendedor_id
            stmtOrcamento.setObject(6, orcamento.lojaId);       // ✅ id_loja
            stmtOrcamento.setString(7, orcamento.usuarioNome);  // ✅ vendedor (nome)
            
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

    public static class Orcamento implements java.io.Serializable {
        private static final long serialVersionUID = 1L;
        
        public Long id;
        public Long clienteId;
        public String clienteNome;
        public List<ItemOrcamento> lentes;
        public List<ItemOrcamento> produtos;
        public double total;
        public LocalDateTime dataHora;
        public String status;
        public Integer usuarioId;     // ✅ NOVO
        public String usuarioNome;    // ✅ NOVO
        public Integer lojaId;        // ✅ NOVO
    }

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

    public static class Tratamento implements java.io.Serializable {
        private static final long serialVersionUID = 1L;
        
        public int codigo;
        public String nome;
        public double valor;
    }

    public static class Coloracao implements java.io.Serializable {
        private static final long serialVersionUID = 1L;
        
        public String nome;
        public String tipo;
        public double valor;
        public String hex;
    }
}
