'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft, Send } from 'lucide-react';

interface Question {
  type: 'radio' | 'textarea' | 'mcq' | 'subjective';
  question: string;
  options?: string[];
}

interface SurveyData {
  id: string;
  topic: string;
  target?: string;
  questions: Question[];
  lang?: string;
}

export default function SurveyResponsePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const surveyId = resolvedParams.id;
  const router = useRouter();

  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    async function fetchSurvey() {
      if (!surveyId) return;
      try {
        setLoading(true);
        const { data, error: fetchErr } = await supabase
          .from('surveys')
          .select('*')
          .eq('id', surveyId)
          .single();

        if (fetchErr || !data) {
          console.error("Supabase load error:", fetchErr);
          setError('설문조사를 찾을 수 없거나 삭제되었습니다.');
        } else {
          setSurvey(data as SurveyData);
        }
      } catch (err) {
        console.error(err);
        setError('설문 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchSurvey();
  }, [surveyId]);

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey) return;

    setIsSubmitting(true);
    try {
      // Save responses to Supabase
      const { error: insertErr } = await supabase.from('survey_responses').insert({
        survey_id: surveyId,
        answers: answers,
        submitted_at: new Date().toISOString(),
      });

      if (insertErr) {
        console.warn('Response insert warning:', insertErr.message);
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('제출 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-gray-600">설문지 데이터를 불러오는 중입니다...</p>
        </div>
      </main>
    );
  }

  if (error || !survey) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">설문지를 불러올 수 없습니다</h1>
          <p className="text-sm text-gray-500 mb-6">{error || '요청하신 설문조사가 존재하지 않습니다.'}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
          >
            메인 페이지로 이동
          </button>
        </div>
      </main>
    );
  }

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-md border border-gray-100 text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">설문 제출 완료!</h1>
            <p className="text-sm text-gray-500">
              소중한 응답이 성공적으로 등록되었습니다. 질문에 응해주셔서 감사합니다.
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition cursor-pointer"
          >
            홈으로 돌아가기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-sans">
      <div className="max-w-2xl w-full">
        
        {/* 상단 네비게이션 */}
        <button
          onClick={() => router.push('/')}
          className="text-gray-500 mb-6 text-sm hover:text-gray-800 flex items-center gap-2 cursor-pointer transition"
        >
          <ArrowLeft className="w-4 h-4" /> 메인으로 돌아가기
        </button>

        {/* 설문 제목 헤더 카드 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-3xl shadow-md mb-8">
          <span className="text-xs font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full">
            Q&S 설문조사
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-3 mb-2">{survey.topic}</h1>
          {survey.target && (
            <p className="text-sm text-blue-100 font-medium">
              대상: <span className="underline">{survey.target}</span>
            </p>
          )}
        </div>

        {/* 설문 질문 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {survey.questions && survey.questions.map((q, idx) => {
            const isRadio = q.type === 'radio' || q.type === 'mcq';
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition hover:shadow-md"
              >
                <div className="flex items-start gap-3 mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-md whitespace-nowrap">
                    Q{idx + 1}
                  </span>
                  <h2 className="text-base md:text-lg font-bold text-gray-900 pt-0.5">
                    {q.question}
                  </h2>
                </div>

                {isRadio && q.options && q.options.length > 0 && (
                  <div className="space-y-2.5 ml-1">
                    {q.options.map((opt, oIdx) => (
                      <label
                        key={oIdx}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                          answers[idx] === opt
                            ? 'bg-blue-50/70 border-blue-500 text-blue-950 font-semibold'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${idx}`}
                          value={opt}
                          checked={answers[idx] === opt}
                          onChange={(e) => handleAnswerChange(idx, e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                          required
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {(!isRadio || !q.options || q.options.length === 0) && (
                  <textarea
                    rows={4}
                    placeholder="답변을 자유롭게 입력해 주세요..."
                    value={answers[idx] || ''}
                    onChange={(e) => handleAnswerChange(idx, e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                    required
                  />
                )}
              </div>
            );
          })}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition shadow-md disabled:bg-gray-400 cursor-pointer flex items-center justify-center gap-2 text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> 제출 중...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" /> 제출하기
              </>
            )}
          </button>
        </form>

      </div>
    </main>
  );
}