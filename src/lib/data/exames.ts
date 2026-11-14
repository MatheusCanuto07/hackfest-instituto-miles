export type Categoria =
	| 'Retina e nervo óptico'
	| 'Glaucoma e pressão ocular'
	| 'Córnea e cristalino'
	| 'Função visual'
	| 'Consulta';

export interface Exame {
	id: string;
	nome: string;
	sigtap: string;
	categoria: Categoria;
	atalho: string;
	sinonimos: string[];
	frequente?: boolean;
}

export const CATEGORIAS: Categoria[] = [
	'Retina e nervo óptico',
	'Glaucoma e pressão ocular',
	'Córnea e cristalino',
	'Função visual'
];

// Grupo 02.11.06 (Diagnóstico em oftalmologia) da Tabela SIGTAP, competência 10/2026.
export const EXAMES: Exame[] = [
	{
		id: 'tonometria',
		nome: 'Tonometria',
		sigtap: '02.11.06.025-9',
		categoria: 'Glaucoma e pressão ocular',
		atalho: 'tono',
		sinonimos: ['tonometria', 'tono', 'pressao intraocular', 'pressao intra-ocular', 'aplanacao'],
		frequente: true
	},
	{
		id: 'cdpo',
		nome: 'Curva diária de pressão ocular (CDPO)',
		sigtap: '02.11.06.006-2',
		categoria: 'Glaucoma e pressão ocular',
		atalho: 'cdpo',
		sinonimos: ['cdpo', 'curva diaria de pressao', 'curva tensional']
	},
	{
		id: 'gonioscopia',
		nome: 'Gonioscopia',
		sigtap: '02.11.06.011-9',
		categoria: 'Glaucoma e pressão ocular',
		atalho: 'gonio',
		sinonimos: ['gonioscopia', 'gonio']
	},
	{
		id: 'campimetria',
		nome: 'Campimetria computadorizada ou manual com gráfico',
		sigtap: '02.11.06.003-8',
		categoria: 'Glaucoma e pressão ocular',
		atalho: 'campo',
		sinonimos: ['campimetria', 'campo visual'],
		frequente: true
	},
	{
		id: 'provocacao-glaucoma',
		nome: 'Teste de provocação de glaucoma',
		sigtap: '02.11.06.020-8',
		categoria: 'Glaucoma e pressão ocular',
		atalho: 'provoc',
		sinonimos: ['teste de provocacao', 'prova de provocacao']
	},
	{
		id: 'biomicroscopia-fundo',
		nome: 'Biomicroscopia de fundo de olho',
		sigtap: '02.11.06.002-0',
		categoria: 'Retina e nervo óptico',
		atalho: 'biofundo',
		sinonimos: ['biomicroscopia de fundo', 'biomicroscopia de fundo de olho'],
		frequente: true
	},
	{
		id: 'fundoscopia',
		nome: 'Fundoscopia',
		sigtap: '02.11.06.010-0',
		categoria: 'Retina e nervo óptico',
		atalho: 'fo',
		sinonimos: ['fundoscopia', 'fundo de olho', 'fo', 'oftalmoscopia'],
		frequente: true
	},
	{
		id: 'mapeamento-retina',
		nome: 'Mapeamento de retina',
		sigtap: '02.11.06.012-7',
		categoria: 'Retina e nervo óptico',
		atalho: 'mapa',
		sinonimos: ['mapeamento de retina', 'mapeamento'],
		frequente: true
	},
	{
		id: 'retinografia-colorida',
		nome: 'Retinografia colorida binocular',
		sigtap: '02.11.06.017-8',
		categoria: 'Retina e nervo óptico',
		atalho: 'retcor',
		sinonimos: ['retinografia colorida', 'retino']
	},
	{
		id: 'retinografia-fluorescente',
		nome: 'Retinografia fluorescente binocular',
		sigtap: '02.11.06.018-6',
		categoria: 'Retina e nervo óptico',
		atalho: 'angio',
		sinonimos: ['retinografia fluorescente', 'angiofluoresceinografia', 'angiografia', 'angio']
	},
	{
		id: 'oct',
		nome: 'Tomografia de coerência óptica (OCT)',
		sigtap: '02.11.06.028-3',
		categoria: 'Retina e nervo óptico',
		atalho: 'oct',
		sinonimos: ['oct', 'tomografia de coerencia optica', 'tomografia de coerencia'],
		frequente: true
	},
	{
		id: 'eletrorretinografia',
		nome: 'Eletrorretinografia',
		sigtap: '02.11.06.008-9',
		categoria: 'Retina e nervo óptico',
		atalho: 'erg',
		sinonimos: ['eletrorretinografia', 'eletroretinografia', 'erg']
	},
	{
		id: 'biometria',
		nome: 'Biometria ultrassônica (monocular)',
		sigtap: '02.11.06.001-1',
		categoria: 'Córnea e cristalino',
		atalho: 'biom',
		sinonimos: ['biometria', 'biometria ultrassonica'],
		frequente: true
	},
	{
		id: 'ceratometria',
		nome: 'Ceratometria',
		sigtap: '02.11.06.005-4',
		categoria: 'Córnea e cristalino',
		atalho: 'cerato',
		sinonimos: ['ceratometria', 'ceratometro']
	},
	{
		id: 'microscopia-especular',
		nome: 'Microscopia especular de córnea',
		sigtap: '02.11.06.014-3',
		categoria: 'Córnea e cristalino',
		atalho: 'especular',
		sinonimos: ['microscopia especular', 'especular', 'contagem endotelial']
	},
	{
		id: 'topografia-cornea',
		nome: 'Topografia computadorizada de córnea',
		sigtap: '02.11.06.026-7',
		categoria: 'Córnea e cristalino',
		atalho: 'topo',
		sinonimos: ['topografia de cornea', 'topografia corneana', 'topografia']
	},
	{
		id: 'estesiometria',
		nome: 'Estesiometria',
		sigtap: '02.11.06.009-7',
		categoria: 'Córnea e cristalino',
		atalho: 'estesio',
		sinonimos: ['estesiometria']
	},
	{
		id: 'potencial-acuidade',
		nome: 'Potencial de acuidade visual',
		sigtap: '02.11.06.015-1',
		categoria: 'Função visual',
		atalho: 'pav',
		sinonimos: ['potencial de acuidade visual', 'pav']
	},
	{
		id: 'visao-cores',
		nome: 'Teste de visão de cores',
		sigtap: '02.11.06.022-4',
		categoria: 'Função visual',
		atalho: 'cores',
		sinonimos: ['visao de cores', 'ishihara', 'teste de cores']
	},
	{
		id: 'teste-ortoptico',
		nome: 'Teste ortóptico',
		sigtap: '02.11.06.023-2',
		categoria: 'Função visual',
		atalho: 'orto',
		sinonimos: ['teste ortoptico', 'exame ortoptico', 'ortoptico']
	},
	{
		id: 'schirmer',
		nome: 'Teste de Schirmer',
		sigtap: '02.11.06.021-6',
		categoria: 'Função visual',
		atalho: 'schirmer',
		sinonimos: ['schirmer', 'teste de schirmer']
	},
	{
		id: 'potencial-evocado',
		nome: 'Potencial visual evocado',
		sigtap: '02.11.06.016-0',
		categoria: 'Função visual',
		atalho: 'pve',
		sinonimos: ['potencial visual evocado', 'pev', 'pve']
	}
];
