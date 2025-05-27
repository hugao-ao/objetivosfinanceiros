import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDiagnostico } from '../../context/DiagnosticoContext';
import { BemPatrimonial } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const patrimonioSchema = z.object({
  bensPatrimoniais: z.array(
    z.object({
      id: z.string(),
      tipo: z.string().min(1, 'Tipo é obrigatório'),
      descricao: z.string().min(1, 'Descrição é obrigatória'),
      valor: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
      possuiFinanciamento: z.boolean(),
    })
  ),
});

type PatrimonioFormValues = {
  bensPatrimoniais: BemPatrimonial[];
};

const tiposBens = [
  'Imóvel',
  'Veículo',
  'Investimento',
  'Obra de Arte',
  'Joia',
  'Equipamento',
  'Outros',
];

const PatrimonioForm: React.FC = () => {
  const { diagnostico, setDiagnostico, avancarEtapa, voltarEtapa } = useDiagnostico();
  
  const { register, control, handleSubmit, formState: { errors } } = useForm<PatrimonioFormValues>({
    resolver: zodResolver(patrimonioSchema),
    defaultValues: {
      bensPatrimoniais: diagnostico.bensPatrimoniais.length > 0 
        ? diagnostico.bensPatrimoniais 
        : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'bensPatrimoniais',
  });

  const onSubmit = (data: PatrimonioFormValues) => {
    setDiagnostico({
      ...diagnostico,
      bensPatrimoniais: data.bensPatrimoniais,
    });
    avancarEtapa();
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="section-title">Patrimônio</h2>
      <p className="text-gray-600 mb-6">
        Informe seus bens patrimoniais, como imóveis, veículos e outros itens de valor significativo.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-md mb-4">
            <p className="text-gray-500">Nenhum bem patrimonial cadastrado.</p>
            <p className="text-gray-500 text-sm mt-1">
              Se não possui bens patrimoniais, pode avançar para a próxima etapa.
            </p>
          </div>
        ) : (
          fields.map((field, index) => (
            <div key={field.id} className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-medium">Bem Patrimonial {index + 1}</h3>
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
                    {...register(`bensPatrimoniais.${index}.tipo`)}
                  >
                    <option value="">Selecione...</option>
                    {tiposBens.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                  {errors.bensPatrimoniais?.[index]?.tipo && (
                    <p className="form-error">{errors.bensPatrimoniais[index]?.tipo?.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Descrição</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Apartamento, Carro, Relógio"
                    {...register(`bensPatrimoniais.${index}.descricao`)}
                  />
                  {errors.bensPatrimoniais?.[index]?.descricao && (
                    <p className="form-error">{errors.bensPatrimoniais[index]?.descricao?.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Valor Estimado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0,00"
                    {...register(`bensPatrimoniais.${index}.valor`, { valueAsNumber: true })}
                  />
                  {errors.bensPatrimoniais?.[index]?.valor && (
                    <p className="form-error">{errors.bensPatrimoniais[index]?.valor?.message}</p>
                  )}
                </div>
                
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id={`financiamento-${index}`}
                    className="mr-2 h-4 w-4"
                    {...register(`bensPatrimoniais.${index}.possuiFinanciamento`)}
                  />
                  <label htmlFor={`financiamento-${index}`} className="form-label m-0">
                    Possui financiamento
                  </label>
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
              descricao: '', 
              valor: 0, 
              possuiFinanciamento: false 
            })}
            className="btn-outline w-full"
          >
            + Adicionar Bem Patrimonial
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

export default PatrimonioForm;
