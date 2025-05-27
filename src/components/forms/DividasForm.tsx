import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDiagnostico } from '../../context/DiagnosticoContext';
import { Divida } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const dividasSchema = z.object({
  dividas: z.array(
    z.object({
      id: z.string(),
      tipo: z.string().min(1, 'Tipo é obrigatório'),
      descricao: z.string().min(1, 'Descrição é obrigatória'),
      valorTotal: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
      taxaJuros: z.number().min(0, 'Taxa deve ser maior ou igual a zero'),
      prazoMeses: z.number().min(1, 'Prazo deve ser maior que zero'),
      valorParcela: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
    })
  ),
});

type DividasFormValues = {
  dividas: Divida[];
};

const tiposDividas = [
  'Cartão de Crédito',
  'Empréstimo Pessoal',
  'Financiamento Imobiliário',
  'Financiamento de Veículo',
  'Cheque Especial',
  'Crédito Consignado',
  'Outros',
];

const DividasForm: React.FC = () => {
  const { diagnostico, setDiagnostico, avancarEtapa, voltarEtapa } = useDiagnostico();
  
  const { register, control, handleSubmit, formState: { errors } } = useForm<DividasFormValues>({
    resolver: zodResolver(dividasSchema),
    defaultValues: {
      dividas: diagnostico.dividas.length > 0 
        ? diagnostico.dividas 
        : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'dividas',
  });

  const onSubmit = (data: DividasFormValues) => {
    setDiagnostico({
      ...diagnostico,
      dividas: data.dividas,
    });
    avancarEtapa();
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="section-title">Dívidas</h2>
      <p className="text-gray-600 mb-6">
        Informe todas as suas dívidas atuais, como cartões de crédito, empréstimos, financiamentos, etc.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-md mb-4">
            <p className="text-gray-500">Nenhuma dívida cadastrada.</p>
            <p className="text-gray-500 text-sm mt-1">
              Se não possui dívidas, pode avançar para a próxima etapa.
            </p>
          </div>
        ) : (
          fields.map((field, index) => (
            <div key={field.id} className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-medium">Dívida {index + 1}</h3>
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
                    {...register(`dividas.${index}.tipo`)}
                  >
                    <option value="">Selecione...</option>
                    {tiposDividas.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                  {errors.dividas?.[index]?.tipo && (
                    <p className="form-error">{errors.dividas[index]?.tipo?.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Descrição</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Financiamento Casa, Empréstimo Banco X"
                    {...register(`dividas.${index}.descricao`)}
                  />
                  {errors.dividas?.[index]?.descricao && (
                    <p className="form-error">{errors.dividas[index]?.descricao?.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Valor Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0,00"
                    {...register(`dividas.${index}.valorTotal`, { valueAsNumber: true })}
                  />
                  {errors.dividas?.[index]?.valorTotal && (
                    <p className="form-error">{errors.dividas[index]?.valorTotal?.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Taxa de Juros (% ao mês)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0,00"
                    {...register(`dividas.${index}.taxaJuros`, { valueAsNumber: true })}
                  />
                  {errors.dividas?.[index]?.taxaJuros && (
                    <p className="form-error">{errors.dividas[index]?.taxaJuros?.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Prazo Restante (meses)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    {...register(`dividas.${index}.prazoMeses`, { valueAsNumber: true })}
                  />
                  {errors.dividas?.[index]?.prazoMeses && (
                    <p className="form-error">{errors.dividas[index]?.prazoMeses?.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Valor da Parcela (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0,00"
                    {...register(`dividas.${index}.valorParcela`, { valueAsNumber: true })}
                  />
                  {errors.dividas?.[index]?.valorParcela && (
                    <p className="form-error">{errors.dividas[index]?.valorParcela?.message}</p>
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
              descricao: '', 
              valorTotal: 0, 
              taxaJuros: 0, 
              prazoMeses: 1,
              valorParcela: 0
            })}
            className="btn-outline w-full"
          >
            + Adicionar Dívida
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

export default DividasForm;
