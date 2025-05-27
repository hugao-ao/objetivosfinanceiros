import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDiagnostico } from '../../context/DiagnosticoContext';
import { DadosPessoais } from '../../types';

const dadosPessoaisSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  idade: z.number().min(18, 'Idade deve ser maior que 18').max(120, 'Idade inválida'),
  estadoCivil: z.string().min(1, 'Estado civil é obrigatório'),
  dependentes: z.number().min(0, 'Número inválido'),
  profissao: z.string().min(1, 'Profissão é obrigatória'),
  regiao: z.string().min(1, 'Região é obrigatória'),
});

const DadosPessoaisForm: React.FC = () => {
  const { diagnostico, setDiagnostico, avancarEtapa } = useDiagnostico();
  
  const { register, handleSubmit, formState: { errors } } = useForm<DadosPessoais>({
    resolver: zodResolver(dadosPessoaisSchema),
    defaultValues: diagnostico.dadosPessoais,
  });

  const onSubmit = (data: DadosPessoais) => {
    setDiagnostico({
      ...diagnostico,
      dadosPessoais: data,
    });
    avancarEtapa();
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="section-title">Dados Pessoais</h2>
      <p className="text-gray-600 mb-6">
        Preencha seus dados pessoais para iniciar o diagnóstico financeiro.
        Estas informações são importantes para personalizar as recomendações.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label htmlFor="nome" className="form-label">Nome (opcional)</label>
            <input
              id="nome"
              type="text"
              className="form-input"
              placeholder="Seu nome"
              {...register('nome')}
            />
            {errors.nome && <p className="form-error">{errors.nome.message}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="idade" className="form-label">Idade</label>
            <input
              id="idade"
              type="number"
              className="form-input"
              placeholder="Sua idade"
              {...register('idade', { valueAsNumber: true })}
            />
            {errors.idade && <p className="form-error">{errors.idade.message}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="estadoCivil" className="form-label">Estado Civil</label>
            <select
              id="estadoCivil"
              className="form-input"
              {...register('estadoCivil')}
            >
              <option value="">Selecione...</option>
              <option value="solteiro">Solteiro(a)</option>
              <option value="casado">Casado(a)</option>
              <option value="divorciado">Divorciado(a)</option>
              <option value="viuvo">Viúvo(a)</option>
              <option value="uniao_estavel">União Estável</option>
            </select>
            {errors.estadoCivil && <p className="form-error">{errors.estadoCivil.message}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="dependentes" className="form-label">Número de Dependentes</label>
            <input
              id="dependentes"
              type="number"
              className="form-input"
              placeholder="Número de dependentes"
              min="0"
              {...register('dependentes', { valueAsNumber: true })}
            />
            {errors.dependentes && <p className="form-error">{errors.dependentes.message}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="profissao" className="form-label">Profissão/Ocupação</label>
            <input
              id="profissao"
              type="text"
              className="form-input"
              placeholder="Sua profissão"
              {...register('profissao')}
            />
            {errors.profissao && <p className="form-error">{errors.profissao.message}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="regiao" className="form-label">Região onde mora</label>
            <select
              id="regiao"
              className="form-input"
              {...register('regiao')}
            >
              <option value="">Selecione...</option>
              <option value="norte">Norte</option>
              <option value="nordeste">Nordeste</option>
              <option value="centro_oeste">Centro-Oeste</option>
              <option value="sudeste">Sudeste</option>
              <option value="sul">Sul</option>
            </select>
            {errors.regiao && <p className="form-error">{errors.regiao.message}</p>}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button type="submit" className="btn-primary">
            Próximo
          </button>
        </div>
      </form>
    </div>
  );
};

export default DadosPessoaisForm;
