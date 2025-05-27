import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDiagnostico } from '../../context/DiagnosticoContext';
import { Investimento } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const investimentosSchema = z.object({
  investimentos: z.array(
    z.object({
      id: z.string(),
      tipo: z.string().min(1, 'Tipo é obrigatório'),
      instituicao: z.string().min(1, 'Instituição é obrigatória'),
      valor: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
      rentabilidade: z.number(),
    })
  ),
});

type InvestimentosFormValues = {
  investimentos: Investimento[];
};

const tiposInvestimentos = [
  'Poupança',
  'CDB',
  'LCI/LCA',
  'Tesouro Direto',
  'Fundos de Investimento',
  'Ações',
  'Fundos Imobiliários',
  'Previdência Privada',
  'Outros',
];

const InvestimentosForm: React.FC = () => {
  const { diagnostico, setDiagnostico, avancarEtapa, voltarEtapa } = useDiagnostico();
  
  const { register, control, handleSubmit, formState: { errors } } = useForm<InvestimentosFormValues>({
    resolver: zodResolver(investimentosSchema),
    defaultValues: {
      investimentos: diagnostico.investimentos.length > 0 
        ? diagnostico.investimentos 
        : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'investimentos',
  });

  const onSubmit = (data: InvestimentosFormValues) => {
    setDiagnostico({
      ...diagnostico,
      investimentos: data.investimentos,
    });
    avancarEtapa();
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="section-title">Investimentos</h2>
      <p className="text-gray-600 mb-6">
        Informe seus investimentos atuais, como poupança, CDBs, ações, fundos imobiliários, etc.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-md mb-4">
            <p className="text-gray-500">Nenhum investimento cadastrado.</p>
            <p className="text-gray-500 text-sm mt-1">
              Se não possui investimentos, pode avançar para a próxima etapa.
            </p>
          </div>
        ) : (
          fields.map((field, index) => (
            <div key={field.id} className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-medium">Investimento {index + 1}</h3>
                <button 
                  type="button" 
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remover
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Tipo</label>
                  <select
                    className="form-input"
                    {...register(`investimentos.${index}.tipo`)}
                  >
                    <option value="">Selecione...</option>
                    {tiposInvestimentos.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                  {errors.investimentos?.[index]?.tipo && (
                    <p className="form-error">{errors.investimentos[index]?.tipo?.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Instituição</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Banco X, Corretora Y"
                    {...register(`investimentos.${index}.instituicao`)}
                  />
                  {errors.investimentos?.[index]?.instituicao && (
                    <p className="form-error">{errors.investimentos[index]?.instituicao?.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Valor Atual (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0,00"
                    {...register(`investimentos.${index}.valor`, { valueAsNumber: true })}
                  />
                  {errors.investimentos?.[index]?.valor && (
                    <p className="form-error">{errors.investimentos[index]?.valor?.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Rentabilidade Média (% ao ano)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0,00"
                    {...register(`investimentos.${index}.rentabilidade`, { valueAsNumber: true })}
                  />
                  {errors.investimentos?.[index]?.rentabilidade && (
                    <p className="form-error">{errors.investimentos[index]?.rentabilidade?.message}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        <div className="mt-4">
          <button
            type="button"
            onClick={() => append({ 
              id: uuidv4(), 
              tipo: '', 
              instituicao: '', 
              valor: 0, 
              rentabilidade: 0 
            })}
            className="btn-outline w-full"
          >
            + Adicionar Investimento
          </button>
        </div>
        
        <div className="mt-6 flex justify-between">
          <button 
            type="button" 
            onClick={voltarEtapa}
            className="btn-outline"
          >
            Voltar
          </button>
          <button type="submit" className="btn-primary">
            Próximo
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvestimentosForm;
