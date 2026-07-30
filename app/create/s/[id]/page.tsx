'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SurveyResponsePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const lang = searchParams.get('lang') || 'ko';

  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchSurvey = async () => {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error(error);
        setError('설문을 찾을 수 없습니다.');
      } else {
        setSurvey(data);
      }
      setLoading(false);
    };

    fetchSurvey();
  }, [id]);

  const handleSubmit = async () => {
    // 나중에 응답 저장 기능을 추가할 수 있습니다
    setSubmitted(true);
    alert('제출이 완료되었습니다. 감사합니다!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-600 text-lg font-medium">{error || '설문을 불러올 수 없습니다.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{survey.topic}</h1>
        <p className="text-sm text-gray-500 mb-8">대상: {survey.target}</p>

        {submitted ? (
          <div className="text-center py-16">
            <p className="text-xl font-semibold text-emerald-600">제출이 완료되었습니다.</p>
            <p className="text-gray-500 mt-2">참여해 주셔서 감사합니다!</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {survey.questions?.map((item: any, index: number) => (
                <div key={index} className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <p className="font-semibold text-gray-800 mb-4">
                    Q{index + 1}. {item.question}
                  </p>

                  {item.type === 'radio' && item.options && (
                    <div className="space-y-3">
                      {item.options.map((opt: string, i: number) => (
                        <label
                          key={i}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer transition"
                        >
                          <input
                            type="radio"
                            name={`q${index}`}
                            value={opt}
                            className="w-4 h-4 text-emerald-600"
                            onChange={(e) =>
                              setAnswers((prev) => ({ ...prev, [index]: e.target.value }))
                            }
                          />
                          <span className="text-sm text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {item.type === 'textarea' && (
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-3 h-28 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      placeholder="답변을 입력해주세요..."
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [index]: e.target.value }))
                      }
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              className="mt-8 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition"
            >
              제출하기
            </button>
          </>
        )}
      </div>
    </div>
  );
}