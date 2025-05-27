import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDiagnostico } from '../../context/DiagnosticoContext';
import { Previdencia } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const previdenciaSchema = z.object({
  previdencias: z.array(
    z.object({
      id: z.string(),
      tipo: z.string().min(1, 'Tipo é obrigatório'),
      contribuicaoMensal: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
      saldoAcumulado: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
    })
  ),
  idadeAposentadoria: z.number().min(0, 'Idade deve ser maior ou igual a zero'),
  rendaDesejada: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
});

type PrevidenciaFormValues = {
  previdencias: Previdencia[];
  idadeAposentadoria: number;
  rendaDesejada: number;
};

const tiposPrevidencia = [
  'INSS',
  'PGBL',
  'VGBL',
  'Previdência Fechada (Fundo de Pensão)',
  'Previdência Complementar',
  'Outros',
];

const AposentadoriaForm: React.FC = () => {
  const { diagnostico, setDiagnostico, avancarEtapa, voltarEtapa } = useDiagnostico();
  
  const { register, control, handleSubmit, formState: { errors } } = useForm<PrevidenciaFormValues>({
    resolver: zodResolver(previdenciaSchema),
    defaultValues: {
      previdencias: diagnostico.previdencias.length > 0 
        ? diagnostico.previdencias 
        : [],
      idadeAposentadoria: 65,
      rendaDesejada: diagnostico.fontesRenda.reduce((sum, fonte) => sum + fonte.valor, 0) * 0.7, // 70% da renda atual
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'previdencias',
  });

  const onSubmit = (data: PrevidenciaFormValues) => {
    const { previdencias, idadeAposentadoria, rendaDesejada } = data;
    
    setDiagnostico({
      ...diagnostico,
      previdencias,
      // Armazenamos os dados adicionais em um campo temporário para uso posterior
      dadosAdicionais: {
        ...diagnostico.dadosAdicionais,
        idadeAposentadoria,
        rendaDesejada,
      },
    });
    avancarEtapa();
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="section-title">Planejamento para Aposentadoria</h2>
      <p className="text-gray-600 mb-6">
        Informe seus planos de previdência e expectativas para aposentadoria.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h3 className="text-md font-medium mb-4">Expectativas para Aposentadoria</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Idade Pretendida para Aposentadoria</label>
              <input
                type="number"
                className="form-input"
                placeholder="65"
                {...register('idadeAposentadoria', { valueAsNumber: true })}
              />
              {errors.idadeAposentadoria && (
                <p className="form-error">{errors.idadeAposentadoria.message}</p>
              )}
            </div>
            
            <div>
              <label className="form-label">Renda Mensal Desejada na Aposentadoria (R$)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="0,00"
                {...register('rendaDesejada', { valueAsNumber: true })}
              />
              {errors.rendaDesejada && (
                <p className="form-error">{errors.rendaDesejada.message}</p>
              )}
            </div>
          </div>
        </div>
        
        <h3 className="text-md font-medium mb-4">Planos de Previdência</h3>
        
        {fields.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-md mb-4">
            <p className="text-gray-500">Nenhum plano de previdência cadastrado.</p>
            <p className="text-gray-500 text-sm mt-1">
              Se não possui planos de previdência, pode avançar para a próxima etapa.
            </p>
          </div>
        ) : (
          fields.map((field, index) => (
            <div key={field.id} className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-medium">Plano de Previdência {index + 1}</h3>
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
                    {...register(`previdencias.${index}.tipo`)}
                  >
                    <option value="">Selecione...</option>
                    {tiposPrevidencia.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                  {errors.previdencias?.[index]?.tipo && (
                    <p className="form-error">{errors.previdencias[index]?.tipo?.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Contribuição Mensal (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0,00"
                    {...register(`previdencias.${index}.contribuicaoMensal`, { valueAsNumber: true })}
                  />
                  {errors.previdencias?.[index]?.contribuicaoMensal && (
                    <p className="form-error">{errors.previdencias[index]?.contribuicaoMensal?.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Saldo Acumulado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0,00"
                    {...register(`previdencias.${index}.saldoAcumulado`, { valueAsNumber: true })}
                  />
                  {errors.previdencias?.[index]?.saldoAcumulado && (
                    <p className="form-error">{errors.previdencias[index]?.saldoAcumulado?.message}</p>
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
              contribuicaoMensal: 0, 
              saldoAcumulado: 0 
            })}
            className="btn-outline w-full"
          >
            + Adicionar Plano de Previdência
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

export default AposentadoriaForm;
