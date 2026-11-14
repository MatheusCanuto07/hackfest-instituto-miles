import { EXAMES } from './data/exames.js';
import { linhaExame } from './prontuario.js';

export interface ExameRealizado {
	uid: string;
	exameId: string;
	detalhes: string;
}

export interface Anamnese {
	qp: string;
	hma: string;
	exames: ExameRealizado[];
}

export function anamneseVazia(): Anamnese {
	return { qp: '', hma: '', exames: [] };
}

/** Textos de exemplo (fictícios) para agilizar a demonstração; os exames ficam para o médico lançar. */
const EXEMPLOS: Record<string, Pick<Anamnese, 'qp' | 'hma'>> = {
	p1: {
		qp: 'Embaçamento visual progressivo em ambos os olhos há 6 meses, pior à noite.',
		hma: 'Paciente de 67 anos, hipertensa e diabética, em acompanhamento de glaucoma primário de ângulo aberto há 1 ano, em uso de timolol 0,5% 2x/dia. Refere piora da visão periférica e dificuldade para dirigir à noite. Nega dor ocular, olho vermelho ou trauma. Realizei tonometria hoje: PIO OD 24 / OE 26 mmHg, acima da meta. Associo brimonidina 0,2% e retorno em 30 dias.'
	},
	p2: {
		qp: 'Baixa da visão no olho direito há 2 meses.',
		hma: 'Diabético tipo 2 há 15 anos, em uso de insulina NPH, com controle irregular (última HbA1c 9,2%). Relata visão turva e manchas no olho direito, sem dor. Realizado mapeamento de retina AO: microaneurismas e exsudatos duros em OD, compatíveis com retinopatia diabética não proliferativa. OCT macular OD com edema macular central. Solicitada retinografia colorida para documentação. Encaminhado para avaliação de tratamento com anti-VEGF.'
	},
	p3: {
		qp: 'Visão distorcida e troca frequente do grau dos óculos há 1 ano.',
		hma: 'Paciente de 24 anos, com rinite alérgica e hábito de coçar os olhos. Refere piora progressiva da visão com óculos, mais no olho direito. Realizadas topografia de córnea e ceratometria AO, com padrão compatível com ceratocone (K máx OD 49,5 D). Teste de Schirmer normal. Orientada a não coçar os olhos. Encaminhada para avaliação de crosslinking.'
	},
	p4: {
		qp: 'Visão embaçada no olho direito, com piora há 1 ano e dificuldade para ler e ver TV.',
		hma: 'Paciente de 78 anos, hipertenso, com catarata senil AO, mais avançada em OD (AV OD conta dedos a 2 m). Avaliação pré-operatória: biometria ultrassônica OD para cálculo da lente intraocular (comprimento axial 23,4 mm) e microscopia especular com contagem endotelial adequada (2.450 células/mm²). Tonometria normal: PIO OD 15 / OE 16 mmHg. Programada facectomia com implante de LIO em OD.'
	}
};

export function anamneseExemplo(pacienteId: string): Anamnese {
	return { ...anamneseVazia(), ...EXEMPLOS[pacienteId] };
}

/** Verdadeiro se o médico ainda não mexeu no exemplo do paciente (ou se está vazio). */
export function eExemploIntocado(a: Anamnese, pacienteId: string): boolean {
	if (!anamnesePreenchida(a)) return true;
	const exemplo = EXEMPLOS[pacienteId];
	return !a.exames.length && !!exemplo && a.qp === exemplo.qp && a.hma === exemplo.hma;
}

export function anamnesePreenchida(a: Anamnese): boolean {
	return a.exames.length > 0 || a.qp.trim() !== '' || a.hma.trim() !== '';
}

export interface ContextoAnamnese {
	paciente: string;
	prontuario: string;
	atendimento: string;
	medico: string;
	dataHora: string;
}

/** Texto para a área de transferência, com cada parte da tela marcada por um cabeçalho. */
export function anamneseParaCopiar(
	a: Anamnese,
	contexto: ContextoAnamnese,
	comExames: boolean
): string {
	const secao = (titulo: string, conteudo: string) =>
		`----- ${titulo} -----\n${conteudo.trim() || '(não preenchido)'}`;

	const partes = [
		'========== ANAMNESE ==========',
		`Paciente: ${contexto.paciente}`,
		`Prontuário: ${contexto.prontuario} | Atendimento: ${contexto.atendimento}`,
		`Data/hora: ${contexto.dataHora} | Médico: ${contexto.medico}`,
		'',
		secao('QUEIXA ATUAL', a.qp),
		'',
		secao('HISTÓRIA DA MOLÉSTIA ATUAL (HMA)', a.hma)
	];

	if (comExames) {
		const exames = a.exames.map((realizado, i) => {
			const exame = EXAMES.find((e) => e.id === realizado.exameId);
			const detalhes = realizado.detalhes.trim();
			return [
				`${i + 1}. ${exame?.nome ?? realizado.exameId}`,
				`   Código SIGTAP: ${exame?.sigtap ?? '-'}`,
				`   Detalhes: ${detalhes || '(sem detalhes)'}`
			].join('\n');
		});
		partes.push(
			'',
			secao(
				`EXAMES COMPLEMENTARES (${a.exames.length})`,
				exames.join('\n\n') || 'Nenhum exame lançado.'
			)
		);
	}

	partes.push('', '========== FIM DA ANAMNESE ==========');
	return partes.join('\n');
}

/** Texto único gravado no campo do prontuário; as linhas [EXAME] são lidas pelo faturamento. */
export function textoAnamnese(a: Anamnese): string {
	const linhas: string[] = [];
	if (a.qp.trim()) linhas.push(`Queixa atual: ${a.qp.trim()}`);
	if (a.hma.trim()) linhas.push(`HMA: ${a.hma.trim()}`);

	const exames = a.exames.flatMap((realizado) => {
		const exame = EXAMES.find((e) => e.id === realizado.exameId);
		if (!exame) return [];
		const detalhes = realizado.detalhes.trim().replace(/\s*\n\s*/g, '; ');
		return [detalhes ? `${linhaExame(exame)} - ${detalhes}` : linhaExame(exame)];
	});
	if (exames.length) linhas.push('Exames complementares:', ...exames);
	return linhas.join('\n');
}
