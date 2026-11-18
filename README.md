# SAM Musical CCB — Vila Rui Barbosa (Jundiaí - SP)

Aplicação web completa para execução local (**localhost**), desenvolvida com base no **Sistema de Administração Musical (SAM)** da Congregação Cristã no Brasil e nos dados oficiais da localidade de **Vila Rui Barbosa**.

---

## 🚀 Como Executar

### Opção 1: Início Rápido (Dois cliques)
Dê um duplo clique no arquivo:
```
iniciar.bat
```
O navegador abrirá automaticamente em [http://localhost:3000](http://localhost:3000).

### Opção 2: Pelo Terminal / Prompt de Comando
Na pasta do projeto:
```bash
# Iniciar o servidor com a aplicação completa
npm start
```
Acesse no seu navegador: **`http://localhost:3000`**

Para desenvolvimento com recarregamento em tempo real (HMR):
```bash
npm run dev
```

---

## 📋 Módulos e Funcionalidades

1. **Visão Geral / Painel (Dashboard)**:
   - Resumo do Corpo Musical (50 músicos cadastrados, oficiais e aprendizes).
   - Organistas (19 cadastradas, divididas entre oficializadas, cultos e candidatas).
   - Alunos do GEM (23 aprendizes ativos com controle de presença).
   - Balanço geral de naipes (Cordas 50%, Madeiras 25%, Metais 25%) e das 4 vozes (Soprano, Contralto, Tenor e Baixo).
   - Diagnósticos imediatos de equilíbrio.

2. **Orquestra & Diagnóstico (MOO CCB)**:
   - Diagnóstico da **Formação Simples** e **Formação Completa**.
   - Seletor interativo da quantidade de músicos desejada (meta de 4 a 64+ músicos).
   - Comparativo entre *Apenas Oficializados* e *Orquestra Completa + GEM*.
   - Cartões visuais de cada instrumento com as cores oficiais:
     - 🔵 **Azul**: Quantidade Necessária (Faltando).
     - 🟢 **Verde**: Quantidade Adequada (Ideal / OK).
     - 🔴 **Vermelho**: Quantidade em Excesso.
   - Proporção exata das 4 vozes e naipes.

3. **Corpo Musical (Músicos)**:
   - Tabela pesquisável com filtros por naipe (Cordas, Madeiras, Metais) e fase (Oficializado, Culto Oficial, RJM, Ensaio Local, GEM).
   - Formulário para Adicionar, Editar e Excluir músicos.
   - Exportação completa da lista em formato CSV.
   - Botão para impressão formatada.

4. **Gestão de Organistas**:
   - Diagnóstico de necessidade para Reunião de Jovens e Menores (RJM) e Cultos Oficiais.
   - Relação de organistas por nível de aptidão (Oficializada, Culto Oficial, Meia Hora, Candidata).
   - Cadastro, edição e exclusão de organistas com telefone e contatos.

5. **GEM & Livro de Chamada Interativo**:
   - Folha de frequência com todos os sábados letivos.
   - Clique simples na célula para alternar a presença:
     - `c` (Verde - Presente)
     - `x` (Vermelho - Falta)
     - `Vazio`
   - Cálculo automático da média de alunos por aula e do total de presenças.
   - Matrícula de novos alunos diretamente pela interface.

6. **Escala & Horários do GEM**:
   - Grade semanal dos sábados dividida entre 15:00h e 16:00h.
   - Matriz por instrutores (André, Matheus, Anderson, Vander, Danilo, Alexandre, Allan, Eliezer) e alunos atribuídos para Teoria (MSA) e Instrumento.

7. **Acervo de Fichas e Formulários CCB**:
   - Catálogo dos 20 modelos oficiais (Voluntário, Cadastro GEM, Pedidos de Avaliação para RJM, Culto Oficial e Oficialização, Programa Mínimo, Fichas de Ensaios, etc.).
   - Visualizador de documento com cabeçalho oficial e botão para impressão direta.

8. **Configurações e Backup**:
   - Alteração dos parâmetros da localidade, cultos por semana e meta de orquestra.
   - Backup com download do arquivo JSON completo.
   - Botão para restauração dos dados originais a qualquer momento.

---

## 💾 Persistência dos Dados
Todos os dados adicionados, editados ou presenças marcadas são salvos automaticamente no arquivo `data.json` na raiz da pasta, garantindo que nada se perca ao fechar ou reiniciar o computador.
