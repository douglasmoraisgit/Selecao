package br.com.vendas.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import br.com.vendas.util.GsonUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * Servlet implementation class AdicionarCarrinho
 */
public class AdicionarCarrinho extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
	// Usa GsonUtils para compatibilidade com LocalDate/LocalDateTime
    private Gson gson = GsonUtils.getGson();
    
    // Parser para versões antigas do Gson (antes da 2.8.6)
    @SuppressWarnings("deprecation")
    private JsonParser jsonParser = new JsonParser();

    public AdicionarCarrinho() {
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
            System.out.println("║  🛒 ADICIONANDO CARRINHO REFATORADO                            ║");
            System.out.println("╚════════════════════════════════════════════════════════════════╝");
            System.out.println("Cliente: " + clienteNome + " (ID: " + clienteId + ")");
            System.out.println("Total: " + totalStr);
            
            // ========================================
            // 2. PROCESSA LENTES
            // ========================================
            
            List<ItemCarrinho> lentes = new ArrayList<>();
            
            if (lentesJson != null && !lentesJson.isEmpty()) {
                // Compatível com Gson < 2.8.6 (usa jsonParser.parse ao invés de JsonParser.parseString)
                @SuppressWarnings("deprecation")
                JsonArray lentesArray = jsonParser.parse(lentesJson).getAsJsonArray();
                
                for (JsonElement element : lentesArray) {
                    JsonObject lenteObj = element.getAsJsonObject();
                    ItemCarrinho item = processarLente(lenteObj);
                    lentes.add(item);
                    
                    System.out.println("  📦 Lente: " + item.descricao);
                    System.out.println("      Olho: " + item.olho);
                    System.out.println("      Qtd: " + item.quantidade);
                    System.out.println("      Preço: " + item.precoTotal);
                    
                    if (item.tratamentos != null && !item.tratamentos.isEmpty()) {
                        System.out.println("      Tratamentos:");
                        for (Tratamento t : item.tratamentos) {
                            System.out.println("        - " + t.nome + " (R$ " + t.valor + ")");
                        }
                    }
                    
                    if (item.coloracao != null) {
                        System.out.println("      Coloração: " + item.coloracao.nome);
                    }
                }
            }
            
            System.out.println("Total de lentes: " + lentes.size());
            
            // ========================================
            // 3. PROCESSA PRODUTOS
            // ========================================
            
            List<ItemCarrinho> produtos = new ArrayList<>();
            
            if (produtosJson != null && !produtosJson.isEmpty()) {
                // Compatível com Gson < 2.8.6 (usa jsonParser.parse ao invés de JsonParser.parseString)
                @SuppressWarnings("deprecation")
                JsonArray produtosArray = jsonParser.parse(produtosJson).getAsJsonArray();
                
                for (JsonElement element : produtosArray) {
                    JsonObject produtoObj = element.getAsJsonObject();
                    ItemCarrinho item = processarProduto(produtoObj);
                    produtos.add(item);
                    
                    System.out.println("  📦 Produto: " + item.descricao);
                }
            }
            
            System.out.println("Total de produtos: " + produtos.size());
            
            // ========================================
            // 4. SALVA NA SESSÃO
            // ========================================
            
            HttpSession session = request.getSession();
            
            // Cria objeto de pedido
            PedidoCarrinho pedido = new PedidoCarrinho();
            pedido.clienteId = clienteId != null ? Long.parseLong(clienteId) : null;
            pedido.clienteNome = clienteNome;
            pedido.lentes = lentes;
            pedido.produtos = produtos;
            pedido.total = totalStr != null ? Double.parseDouble(totalStr) : 0.0;
            
            // Salva na sessão
            session.setAttribute("pedidoCarrinho", pedido);
            session.setAttribute("carrinhoLentes", lentes);
            session.setAttribute("carrinhoProdutos", produtos);
            session.setAttribute("carrinhoCliente", clienteNome);
            session.setAttribute("carrinhoTotal", pedido.total);
            
            System.out.println("✅ Pedido salvo na sessão!");
            
            // ========================================
            // 5. RETORNA SUCESSO
            // ========================================
            
            resultado.addProperty("success", true);
            resultado.addProperty("message", "Itens adicionados ao carrinho com sucesso!");
            resultado.addProperty("quantidadeLentes", lentes.size());
            resultado.addProperty("quantidadeProdutos", produtos.size());
            resultado.addProperty("total", pedido.total);
            
            // URL de redirecionamento (opcional)
            // resultado.addProperty("redirectUrl", "pagamento.jsp");
            
        } catch (Exception e) {
            System.err.println("❌ Erro ao processar carrinho: " + e.getMessage());
            e.printStackTrace();
            
            resultado.addProperty("success", false);
            resultado.addProperty("message", "Erro ao processar carrinho: " + e.getMessage());
        }
        
        out.print(gson.toJson(resultado));
        out.flush();
    }

    /**
     * Processa uma lente do JSON
     */
    private ItemCarrinho processarLente(JsonObject obj) {
        ItemCarrinho item = new ItemCarrinho();
        
        item.id = getStringSeguro(obj, "id");
        item.tipo = "lente";
        item.codigo = getIntSeguro(obj, "codigo");
        item.codigoWeb = getStringSeguro(obj, "codigoWeb");
        item.codigoProdutoFornecedor = getStringSeguro(obj, "codigoProdutoFornecedor");
        item.marca = getStringSeguro(obj, "marca");
        item.familia = getStringSeguro(obj, "familia");
        item.descricao = getStringSeguro(obj, "descricao");
        item.olho = getStringSeguro(obj, "olho");
        item.esf = getDoubleSeguro(obj, "esf");
        item.cil = getDoubleSeguro(obj, "cil");
        item.eixo = getIntSeguro(obj, "eixo");
        item.adicao = getDoubleSeguro(obj, "adicao");
        item.material = getStringSeguro(obj, "material");
        item.indice = getStringSeguro(obj, "indice");
        item.diametro = getStringSeguro(obj, "diametro");
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
                tratamento.codigoFornecedor = getStringSeguro(tratObj, "codigoFornecedor");
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
    private ItemCarrinho processarProduto(JsonObject obj) {
        ItemCarrinho item = new ItemCarrinho();
        
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
    // CLASSES INTERNAS
    // ========================================

    /**
     * Representa um item do carrinho
     */
    public static class ItemCarrinho {
        public String id;
        public String tipo; // "lente" ou "produto"
        public int codigo;
        public String codigoWeb;
        public String codigoProdutoFornecedor;
        public String marca;
        public String familia;
        public String descricao;
        public String olho;
        public double esf;
        public double cil;
        public int eixo;
        public double adicao;
        public String material;
        public String indice;
        public String diametro;
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
    public static class Tratamento {
        public int codigo;
        public String nome;
        public String codigoFornecedor;
        public double valor;
    }

    /**
     * Representa uma coloração
     */
    public static class Coloracao {
        public String nome;
        public String tipo;
        public double valor;
        public String hex;
    }

    /**
     * Representa o pedido completo
     */
    public static class PedidoCarrinho {
        public Long clienteId;
        public String clienteNome;
        public List<ItemCarrinho> lentes;
        public List<ItemCarrinho> produtos;
        public double total;
    }
}