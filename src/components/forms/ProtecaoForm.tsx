import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDiagnostico } from '../../context/DiagnosticoContext';
import { Seguro } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const segurosSchema = z.object({
  seguros: z.array(
    z.object({
      id: z.string(),
      tipo: z.string().min(1, 'Tipo é obrigatório'),
      cobertura: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
      premio: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
      periodicidade: z.string().min(1, 'Periodicidade é obrigatória'),
    })
  ),
});

type SegurosFormValues = {
  seguros: Seguro[];
};

const tiposSeguros = [
  'Seguro de Vida',
  'Seguro Saúde',
  'Seguro Residencial',
  'Seguro de Automóvel',
  'Seguro de Responsabilidade Civil',
  'Seguro Viagem',
  'Outros',
];

const periodicidades = [
  'Mensal',
  'Trimestral',
  'Semestral',
  'Anual',
];

const ProtecaoForm: React.FC = () => {
  const { diagnostico, setDiagnostico, avancarEtapa, voltarEtapa } = useDiagnostico();
  
  const { register, control, handleSubmit, formState: { errors } } = useForm<SegurosFormValues>({
    resolver: zodResolver(segurosSchema),
    defaultValues: {
      seguros: diagnostico.seguros.length > 0 
        ? diagnostico.seguros 
        : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'seguros',
  });

  const onSubmit = (data: SegurosFormValues) => {
    setDiagnostico({
      ...diagnostico,
      seguros: data.seguros,
    });
    avancarEtapa();
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="section-title">Proteção Patrimonial</h2>
      <p className="text-gray-600 mb-6">
        Informe os seguros que você possui atualmente para proteção pessoal e patrimonial.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-md mb-4">
            <p className="text-gray-500">Nenhum seguro cadastrado.</p>
            <p className="text-gray-500 text-sm mt-1">
              Se não possui seguros, pode avançar para a próxima etapa.
            </p>
          </div>
        ) : (
          fields.map((field, index) => (
            <div key={field.id} className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-medium">Seguro {index + 1}</h3>
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
                    {...register(`seguros.${index}.tipo`)}
                  >
                    <option value="">Selecione...</option>
                    {tiposSeguros.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                  {errors.seguros?.[index]?.tipo && (
                    <p className="form-error">{errors.seguros[index]?.tipo?.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Valor da Cobertura (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0,00"
                    {...register(`seguros.${index}.cobertura`, { valueAsNumber: true })}
                  />
                  {errors.seguros?.[index]?.cobertura && (
                    <p className="form-error">{errors.seguros[index]?.cobertura?.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Valor do Prêmio (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0,00"
                    {...register(`seguros.${index}.premio`, { valueAsNumber: true })}
                  />
                  {errors.seguros?.[index]?.premio && (
                    <p className="form-error">{errors.seguros[index]?.premio?.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Periodicidade</label>
                  <select
                    className="form-input"
                    {...register(`seguros.${index}.periodicidade`)}
                  >
                    <option value="">Selecione...</option>
                    {periodicidades.map((periodicidade) => (
                      <option key={periodicidade} value={periodicidade}>
                        {periodicidade}
                      </option>
                    ))}
                  </select>
                  {errors.seguros?.[index]?.periodicidade && (
                    <p className="form-error">{errors.seguros[index]?.periodicidade?.message}</p>
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
              cobertura: 0, 
              premio: 0, 
              periodicidade: '' 
            })}
            className="btn-outline w-full"
          >
            + Adicionar Seguro
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

export default ProtecaoForm;
