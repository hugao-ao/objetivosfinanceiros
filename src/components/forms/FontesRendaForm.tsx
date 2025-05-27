import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDiagnostico } from '../../context/DiagnosticoContext';
import { FonteRenda } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const fontesRendaSchema = z.object({
  fontesRenda: z.array(
    z.object({
      id: z.string(),
      descricao: z.string().min(1, 'Descrição é obrigatória'),
      valor: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
    })
  ),
});

type FontesRendaFormValues = {
  fontesRenda: FonteRenda[];
};

const FontesRendaForm: React.FC = () => {
  const { diagnostico, setDiagnostico, avancarEtapa, voltarEtapa } = useDiagnostico();
  
  const { register, control, handleSubmit, formState: { errors } } = useForm<FontesRendaFormValues>({
    resolver: zodResolver(fontesRendaSchema),
    defaultValues: {
      fontesRenda: diagnostico.fontesRenda.length > 0 
        ? diagnostico.fontesRenda 
        : [{ id: uuidv4(), descricao: '', valor: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fontesRenda',
  });

  const onSubmit = (data: FontesRendaFormValues) => {
    setDiagnostico({
      ...diagnostico,
      fontesRenda: data.fontesRenda,
    });
    avancarEtapa();
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="section-title">Fontes de Renda</h2>
      <p className="text-gray-600 mb-6">
        Informe todas as suas fontes de renda mensais, como salários, rendimentos de investimentos, aluguéis, etc.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => (
          <div key={field.id} className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-medium">Fonte de Renda {index + 1}</h3>
              {fields.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remover
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Descrição</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Salário, Aluguel, Freelance"
                  {...register(`fontesRenda.${index}.descricao`)}
                />
                {errors.fontesRenda?.[index]?.descricao && (
                  <p className="form-error">{errors.fontesRenda[index]?.descricao?.message}</p>
                )}
              </div>
              
              <div>
                <label className="form-label">Valor Mensal (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="0,00"
                  {...register(`fontesRenda.${index}.valor`, { valueAsNumber: true })}
                />
                {errors.fontesRenda?.[index]?.valor && (
                  <p className="form-error">{errors.fontesRenda[index]?.valor?.message}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <div className="mt-4">
          <button
            type="button"
            onClick={() => append({ id: uuidv4(), descricao: '', valor: 0 })}
            className="btn-outline w-full"
          >
            + Adicionar Fonte de Renda
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

export default FontesRendaForm;
