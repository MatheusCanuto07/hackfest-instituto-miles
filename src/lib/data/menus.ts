import {
	BedDouble,
	ChartColumn,
	ClipboardList,
	DoorOpen,
	FileSpreadsheet,
	FileText,
	FlaskConical,
	FolderSearch,
	HeartPulse,
	MessageSquareText,
	NotebookText,
	Receipt,
	Stethoscope,
	Wallet
} from '@lucide/svelte';
import type { Component } from 'svelte';

export interface ItemMenu {
	rotulo: string;
	icone: Component<{ size?: number }>;
	ativo?: boolean;
}

export const menuMedico: ItemMenu[] = [
	{ rotulo: 'Resumo acolhimento', icone: ClipboardList },
	{ rotulo: 'Atendimento médico', icone: Stethoscope, ativo: true },
	{ rotulo: 'Minhas anamneses', icone: NotebookText },
	{ rotulo: 'Resul. exames', icone: FlaskConical },
	{ rotulo: 'Solic. internação', icone: BedDouble },
	{ rotulo: 'Parecer', icone: MessageSquareText },
	{ rotulo: 'Registro enfermagem', icone: HeartPulse },
	{ rotulo: 'Alta médica', icone: DoorOpen },
	{ rotulo: 'Consulta prontuário', icone: FolderSearch }
];

export const menuFaturamento: ItemMenu[] = [
	{ rotulo: 'Contas pendentes', icone: Receipt, ativo: true },
	{ rotulo: 'AIH', icone: FileText },
	{ rotulo: 'BPA', icone: FileSpreadsheet },
	{ rotulo: 'Glosas', icone: Wallet },
	{ rotulo: 'Consulta prontuário', icone: FolderSearch },
	{ rotulo: 'Relatórios', icone: ChartColumn }
];
