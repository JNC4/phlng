# Philosophical Network Graph

An interactive web application for visualizing (philosophical) ideas and their relationships. Map concepts, arguments, and logical connections in a dynamic network graph.

This is a proof of concept that I have been thinking about for a while. The directions from here one may go that would be productive imo is:

Firstly, one might utilise this general model *externally* along with some scraping miniservice on i.e. scientific papers, then some sort of classification and judgement of strength miniservice, then see what areas of science tend to disagree/agree, or which ones contradict which ones. This would look like an expansion of the code's faculties in computing probabilities and stats, as well as some utilisiation or creation of microservices

Secondly, one could utilise this model *internally* to map your own beliefs and if they are coherent.

Finally, one may utilise this model to evaluate different epistomologies or workshop outside of their mind. For example, if I am exploring the concept of trying to regain the principle of sufficient reason, I might say that we build a coherentist dogmatic view on specific classes of statements (i.e. brute fact such as cogitio ergo sum). This expansion thus is less an expansion of the code and moreso an expansion of the mind. Though frankly it would probably also take 

As an aside it should also be brief and easy to add in a sort of flowing true/false or type of data, as well as well defined AND, NOT, NOR etc gates for the sake of analytic philosophy, external modelling of flow of info ie in the science case, etc.


I mean in some sense it's a model where you get to define relationships and nodes. it's a sandbox. you could even add inter node attacking vs defending and animation and nodes producing other nodes and turn it into an RTS lmao.


AI generated text that nevertheless summarises the project decently well follows:

![Philosophical Network Graph](https://img.shields.io/badge/React-18.0.0-blue) ![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0.0-cyan)

## Features

### Core Functionality
- **Interactive Node Creation**: Add philosophical statements, ideas, and concepts
- **Relationship Mapping**: Create connections between ideas with different relationship types
- **Drag & Drop Interface**: Intuitively move nodes and navigate the graph
- **Zoom & Pan**: Explore large networks with smooth zoom and pan controls

### Advanced Features
- **Custom Node Types**: Create your own knowledge categories (axiom, empirical, theoretical, normative, etc.)
- **Custom Relationship Types**: Define new ways ideas can relate (supports, contradicts, implies, etc.)
- **Strength-Based Arguments**: Assign integer values to support/weaken relationships
- **Automatic Strength Calculation**: Nodes display cumulative argument strength from incoming edges
- **Node Editing**: Click any node to view and edit its full content and properties

### Built-in Examples
- "I think therefore I am" (axiom)
- "It rained on Wednesday" vs "It did not rain on Wednesday" (contradiction)
- Rain → wet road (implication)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/philosophical-network-graph.git
cd philosophical-network-graph