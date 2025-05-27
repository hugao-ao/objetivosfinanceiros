import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDiagnostico } from '../../context/DiagnosticoContext';
import { Despesa } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const despesasSchema = z.object({
  despesas: z.array(
    z.object({
      id: z.string(),
      categoria: z.string().min(1, 'Categoria é obrigatória'),
      descricao: z.string().min(1, 'Descrição é obrigatória'),
      valor: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
      fixa: z.boolean(),
    })
  ),
});

type DespesasFormValues = {
  despesas: Despesa[];
};

const categoriasDespesas = [
  'Moradia',
  'Alimentação',
  'Transporte',
  'Saúde',
  'Educação',
  'Lazer',
  'Vestuário',
  'Comunicação',
  'Serviços',
  'Impostos',
  'Outros',
];

const DespesasForm: React.FC = () => {
  const { diagnostico, setDiagnostico, avancarEtapa, voltarEtapa } = useDiagnostico();
  
  const { register, control, handleSubmit, formState: { errors } } = useForm<DespesasFormValues>({
    resolver: zodResolver(despesasSchema),
    defaultValues: {
      despesas: diagnostico.despesas.length > 0 
        ? diagnostico.despesas 
        : [{ id: uuidv4(), categoria: '', descricao: '', valor: 0, fixa: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'despesas',
  });

  const onSubmit = (data: DespesasFormValues) => {
    setDiagnostico({
      ...diagnostico,
      despesas: data.despesas,
    });
    avancarEtapa();
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="section-title">Despesas Mensais</h2>
      <p className="text-gray-600 mb-6">
        Informe todas as suas despesas mensais, separando entre fixas (que ocorrem todos os meses) e variáveis.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => (
          <div key={field.id} className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-medium">Despesa {index + 1}</h3>
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
                <label className="form-label">Categoria</label>
                <select
                  className="form-input"
                  {...register(`despesas.${index}.categoria`)}
                >
                  <option value="">Selecione...</option>
                  {categoriasDespesas.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
                {errors.despesas?.[index]?.categoria && (
                  <p className="form-error">{errors.despesas[index]?.categoria?.message}</p>
                )}
              </div>
              
              <div>
                <label className="form-label">Descrição</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Aluguel, Supermercado, Gasolina"
                  {...register(`despesas.${index}.descricao`)}
                />
                {errors.despesas?.[index]?.descricao && (
                  <p className="form-error">{errors.despesas[index]?.descricao?.message}</p>
                )}
              </div>
              
              <div>
                <label className="form-label">Valor Mensal (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="0,00"
                  {...register(`despesas.${index}.valor`, { valueAsNumber: true })}
                />
                {errors.despesas?.[index]?.valor && (
                  <p className="form-error">{errors.despesas[index]?.valor?.message}</p>
                )}
              </div>
              
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id={`despesa-fixa-${index}`}
                  className="mr-2 h-4 w-4"
                  {...register(`despesas.${index}.fixa`)}
                />
                <label htmlFor={`despesa-fixa-${index}`} className="form-label m-0">
                  Despesa Fixa
                </label>
              </div>
            </div>
          </div>
        ))}
        
        <div className="mt-4">
          <button
            type="button"
            onClick={() => append({ id: uuidv4(), categoria: '', descricao: '', valor: 0, fixa: true })}
            className="btn-outline w-full"
          >
            + Adicionar Despesa
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

export default DespesasForm;
