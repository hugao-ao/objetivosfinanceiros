import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDiagnostico } from '../../context/DiagnosticoContext';
import { Objetivo } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const objetivosSchema = z.object({
  objetivos: z.array(
    z.object({
      id: z.string(),
      descricao: z.string().min(1, 'Descrição é obrigatória'),
      valor: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
      prazoMeses: z.number().min(1, 'Prazo deve ser maior que zero'),
      prioridade: z.enum(['alta', 'media', 'baixa']),
      categoria: z.enum(['curto', 'medio', 'longo']),
    })
  ),
});

type ObjetivosFormValues = {
  objetivos: Objetivo[];
};

const ObjetivosForm: React.FC = () => {
  const { diagnostico, setDiagnostico, avancarEtapa, voltarEtapa } = useDiagnostico();
  
  const { register, control, handleSubmit, formState: { errors } } = useForm<ObjetivosFormValues>({
    resolver: zodResolver(objetivosSchema),
    defaultValues: {
      objetivos: diagnostico.objetivos.length > 0 
        ? diagnostico.objetivos 
        : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'objetivos',
  });

  const onSubmit = (data: ObjetivosFormValues) => {
    setDiagnostico({
      ...diagnostico,
      objetivos: data.objetivos,
    });
    avancarEtapa();
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="section-title">Objetivos e Metas Financeiras</h2>
      <p className="text-gray-600 mb-6">
        Informe seus objetivos financeiros de curto, médio e longo prazo.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-md mb-4">
            <p className="text-gray-500">Nenhum objetivo cadastrado.</p>
            <p className="text-gray-500 text-sm mt-1">
              Adicione pelo menos um objetivo para um planejamento mais efetivo.
            </p>
          </div>
        ) : (
          fields.map((field, index) => (
            <div key={field.id} className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-medium">Objetivo {index + 1}</h3>
                <button 
                  type="button" 
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remover
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="form-label">Descrição</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Comprar casa, Viagem, Aposentadoria"
                    {...register(`objetivos.${index}.descricao`)}
                  />
                  {errors.objetivos?.[index]?.descricao && (
                    <p className="form-error">{errors.objetivos[index]?.descricao?.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Valor Necessário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0,00"
                    {...register(`objetivos.${index}.valor`, { valueAsNumber: true })}
                  />
                  {errors.objetivos?.[index]?.valor && (
                    <p className="form-error">{errors.objetivos[index]?.valor?.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Prazo (meses)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="12"
                    {...register(`objetivos.${index}.prazoMeses`, { valueAsNumber: true })}
                  />
                  {errors.objetivos?.[index]?.prazoMeses && (
                    <p className="form-error">{errors.objetivos[index]?.prazoMeses?.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Prioridade</label>
                  <select
                    className="form-input"
                    {...register(`objetivos.${index}.prioridade`)}
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                  {errors.objetivos?.[index]?.prioridade && (
                    <p className="form-error">{errors.objetivos[index]?.prioridade?.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Categoria</label>
                  <select
                    className="form-input"
                    {...register(`objetivos.${index}.categoria`)}
                  >
                    <option value="curto">Curto Prazo (até 1 ano)</option>
                    <option value="medio">Médio Prazo (1 a 5 anos)</option>
                    <option value="longo">Longo Prazo (mais de 5 anos)</option>
                  </select>
                  {errors.objetivos?.[index]?.categoria && (
                    <p className="form-error">{errors.objetivos[index]?.categoria?.message}</p>
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
              descricao: '', 
              valor: 0, 
              prazoMeses: 12, 
              prioridade: 'media',
              categoria: 'medio'
            })}
            className="btn-outline w-full"
          >
            + Adicionar Objetivo
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
            Finalizar Diagnóstico
          </button>
        </div>
      </form>
    </div>
  );
};

export default ObjetivosForm;
