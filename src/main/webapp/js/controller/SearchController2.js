/**
 * SearchController.js
 * Responsável por busca progressiva e comunicação com API
 * 
 * RESPONSABILIDADES:
 * - Executar buscas com filtros
 * - Montar payloads para API
 * - Processar resultados da API
 * - Gerenciar debounce de buscas
 * 
 * EVENTOS EMITIDOS:
 * - 'buscaIniciada'     → Busca começou
 * - 'buscaConcluida'    → Busca terminou com sucesso { resultados, quantidade }
 * - 'buscaErro'         → Erro na busca { error }
 * - 'semReceita'        → Tentou buscar sem receita
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';
import { debounce } from '../util/helpers.js';
import Config from '../config.js';

export default class SearchController extends EventEmitter {
    
    constructor({ receitaModel, selecaoAtivaModel, botaoFlutuanteView, filtrosAplicadosView }) {
        super();
        
        // Dependências injetadas
        this.receitaModel = receitaModel;
        this.selecaoAtivaModel = selecaoAtivaModel;
        this.botaoFlutuanteView = botaoFlutuanteView;
        this.filtrosAplicadosView = filtrosAplicadosView;
        
        // Estado interno
        this.ultimoResultado = null;
        
        // Debounce para evitar múltiplas buscas seguidas
        this.buscarComDebounce = debounce(this.executarBusca.bind(this), 300);
    }

    // ========================================
    // MÉTODOS PÚBLICOS
    // ========================================

    /**
     * Busca inicial - chamada ao abrir a aplicação
     * Se tiver receita, faz busca ampla (todos os produtos)
     */
    buscarInicial() {
        console.log('');
        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║  🚀 BUSCA INICIAL (AMPLA)                                      ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        
        const receita = this.recuperarReceita();
        if (!receita) {
            console.log('⚠️ Sem receita cadastrada - aguardando...');
            this.emit('semReceita');
            return;
        }
        
        this.buscarComFiltrosAtuais();
    }

    /**
     * MÉTODO CENTRAL: Busca com todos os filtros atualmente selecionados
     * Chamado sempre que:
     * - Navega para uma categoria
     * - Seleciona/remove um filtro
     * - Salva uma receita
     */
    buscarComFiltrosAtuais() {
        this.buscarComDebounce();
    }

    /**
     * Retorna o último resultado de busca
     */
    getUltimoResultado() {
        return this.ultimoResultado;
    }

    /**
     * Limpa o último resultado
     */
    limparResultado() {
        this.ultimoResultado = null;
    }

    // ========================================
    // EXECUÇÃO DA BUSCA
    // ========================================

    /**
     * Executa a busca de fato (chamada pelo debounce)
     */
    async executarBusca() {
        console.log('');
        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║  🔍 EXECUTANDO BUSCA COM FILTROS ATUAIS                        ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        
        // 1. Recupera receita (obrigatória)
        const receita = this.recuperarReceita();
        if (!receita) {
            console.log('⚠️ Sem receita - mostrando 0 produtos');
            this.emit('semReceita');
            return;
        }
        
        // 2. Notifica início e mostra loading
        this.emit('buscaIniciada');
        this.botaoFlutuanteView.setTexto('buscando...');
        this.botaoFlutuanteView.show();
        
        // 3. Monta payload com TODOS os filtros atuais
        const params = this.montarPayloadCompleto(receita);
        
        console.log('');
        console.log('📤 PAYLOAD:', params.toString());
        console.log('');
        
        // 4. Faz a requisição
        try {
            const response = await fetch(Config.getSelecaoLentesUrl(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                body: params.toString()
            });
            
            const dados = await response.json();
            const resultados = this.processarLentesAgrupadas(dados);
            
            console.log('');
            console.log('╔════════════════════════════════════════════════════════════════╗');
            console.log('║  ✅ BUSCA CONCLUÍDA: ' + resultados.length.toString().padEnd(40) + '║');
            console.log('╚════════════════════════════════════════════════════════════════╝');
            
            // 5. Salva resultado e notifica
            this.ultimoResultado = resultados;
            
            this.emit('buscaConcluida', { 
                resultados, 
                quantidade: resultados.length 
            });
            
        } catch (error) {
            console.error('❌ Erro na busca:', error);
            this.emit('buscaErro', { error });
        }
    }

    // ========================================
    // MONTAGEM DE PAYLOAD
    // ========================================

    /**
     * Monta o payload completo com todos os filtros
     */
    montarPayloadCompleto(receita) {
        const params = new URLSearchParams();
        
        console.log('📝 Montando payload:');
        
        // ========================================
        // 1. DADOS DA RECEITA
        // ========================================
        params.append('rod_esf', receita.rod_esf || 0);
        params.append('rod_cil', receita.rod_cil || 0);
        params.append('rod_eixo', receita.rod_eixo || 0);
        params.append('rod_adicao', receita.rod_adicao || 0);
        params.append('roe_esf', receita.roe_esf || 0);
        params.append('roe_cil', receita.roe_cil || 0);
        params.append('roe_eixo', receita.roe_eixo || 0);
        params.append('roe_adicao', receita.roe_adicao || 0);
        console.log('   📋 Receita: OD(' + (receita.rod_esf||0) + '/' + (receita.rod_cil||0) + ') OE(' + (receita.roe_esf||0) + '/' + (receita.roe_cil||0) + ')');
        
        // ========================================
        // 2. SELEÇÕES ÚNICAS (Visão, Marca, Família)
        // ========================================
        const selecaoAtiva = this.selecaoAtivaModel;
        
        // Tipo de visão
        const visao = selecaoAtiva.get('tipoVisao');
        if (visao && visao.id) {
            params.append('visao', visao.id);
            console.log('   👁️ Visão:', visao.id);
        }
        
        // Família
        const familia = selecaoAtiva.get('familia');
        if (familia && familia.label) {
            params.append('familia', familia.label);
            console.log('   📁 Família:', familia.label);
        }
        
        // Marca única (da navegação)
        const marca = selecaoAtiva.get('marca');
        if (marca && marca.label) {
            params.append('marca', marca.label);
            console.log('   🏢 Marca:', marca.label);
        }
        
        // ========================================
        // 3. PRODUTOS SELECIONADOS (múltiplas marcas)
        // ========================================
        const produtos = selecaoAtiva.getProdutosSelecionados();
        if (produtos.length > 0) {
            console.log('   📦 Produtos selecionados:');
            produtos.forEach(p => {
                if (p.marca) {
                    params.append('marca', p.marca);
                    console.log('      - ' + p.marca);
                }
            });
        }
        
        // ========================================
        // 4. FILTROS DE CONFIGURAÇÃO (múltiplos)
        // ========================================
        
        // Material
        const materiais = selecaoAtiva.get('material');
        if (materiais && materiais.length > 0) {
            materiais.forEach(m => params.append('material', m.label));
            console.log('   🔬 Material:', materiais.map(m => m.label).join(', '));
        }
        
        // Anti-Reflexo
        const ars = selecaoAtiva.get('antireflexo');
        if (ars && ars.length > 0) {
            ars.forEach(ar => params.append('antireflexo', ar.label));
            console.log('   ✨ Anti-Reflexo:', ars.map(ar => ar.label).join(', '));
        }
        
        // Fotossensível
        const fotos = selecaoAtiva.get('fotossensivel');
        if (fotos && fotos.length > 0) {
            fotos.forEach(f => params.append('fotossensivel', f.label));
            console.log('   ☀️ Fotossensível:', fotos.map(f => f.label).join(', '));
        }
        
        // Coloração (NOVO) - envia nome e tipo
        const cores = selecaoAtiva.get('coloracao');
        if (cores && cores.length > 0) {
            cores.forEach(c => {
                params.append('coloracao', c.label);
                // Envia o tipo (Total ou Degradê) se disponível
                if (c.tipoColoracao) {
                    params.append('coloracaoTipo', c.tipoColoracao);
                }
            });
            console.log('   🎨 Coloração:', cores.map(c => `${c.label} (${c.tipoColoracao || 'N/A'})`).join(', '));
        }
        
        // Anti-Blue
        const blues = selecaoAtiva.get('antiblue');
        if (blues && blues.length > 0) {
            blues.forEach(b => params.append('antiblue', b.label));
            console.log('   💙 Anti-Blue:', blues.map(b => b.label).join(', '));
        }
        
        // Índice
        const indices = selecaoAtiva.get('indice');
        if (indices && indices.length > 0) {
            indices.forEach(i => params.append('indice', i.label));
            console.log('   📊 Índice:', indices.map(i => i.label).join(', '));
        }
        
        return params;
    }

    // ========================================
    // PROCESSAMENTO DE RESULTADOS
    // ========================================

    /**
     * Processa dados brutos da API em formato utilizável
     */
    processarLentesAgrupadas(data) {
        const resultados = [];
        
        console.log('📦 Dados brutos recebidos:', data);
        
        // Estrutura do servlet: { marca: { codigoWeb: { OD: [...], OE: [...] } } }
        Object.keys(data).forEach(marca => {
            const variantes = data[marca];
            
            Object.keys(variantes).forEach(codigoWeb => {
                const variante = variantes[codigoWeb];
                
                const hasOD = variante.OD && variante.OD.length > 0;
                const hasOE = variante.OE && variante.OE.length > 0;
                
                console.log(`🔍 ${marca} ${codigoWeb}: hasOD=${hasOD}, hasOE=${hasOE}`);
                
                if (hasOD || hasOE) {
                    const od = hasOD ? variante.OD[0] : null;
                    const oe = hasOE ? variante.OE[0] : null;
                    
                    resultados.push({
                        marca: marca,
                        codigoWeb: codigoWeb,
                        od: od || oe,
                        oe: oe || od,
                        hasOD: hasOD,
                        hasOE: hasOE,
                        lentes: variante
                    });
                }
            });
        });
        
        console.log('');
        console.log('✅ ============================================');
        console.log('✅ PROCESSAMENTO CONCLUÍDO');
        console.log('✅ Total de resultados:', resultados.length);
        if (resultados.length > 0) {
            console.log('✅ Exemplo de resultado:', resultados[0]);
        }
        console.log('✅ ============================================');
        console.log('');
        
        return resultados;
    }

    // ========================================
    // RECEITA
    // ========================================

    /**
     * Recupera receita válida do model
     */
    recuperarReceita() {
        const receita = this.receitaModel.getReceita();
        
        if (!receita) return null;
        
        const temValor = receita.rod_esf || receita.rod_cil || 
                        receita.roe_esf || receita.roe_cil ||
                        receita.rod_adicao || receita.roe_adicao;
        
        return temValor ? receita : null;
    }
}
