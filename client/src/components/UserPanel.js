import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function UserPanel() {
  const { sessionCode } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/polls/${sessionCode}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch poll');
        }

        setPoll(data);
        // Check if user has already voted
        const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
        if (votedPolls[sessionCode]) {
          setHasVoted(true);
          setShowNameInput(false);
          // Restore username if previously voted
          const savedUsername = localStorage.getItem(`poll_${sessionCode}_username`);
          if (savedUsername) {
            setUsername(savedUsername);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [sessionCode]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your name');
      return;
    }
    setShowNameInput(false);
    // Store username in localStorage
    localStorage.setItem(`poll_${sessionCode}_username`, username);
  };

  const handleVote = async (optionIndex) => {
    try {
      const response = await fetch(`http://localhost:5000/api/polls/${sessionCode}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          optionIndex,
          username: localStorage.getItem(`poll_${sessionCode}_username`)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit vote');
      }

      setPoll(data.poll);
      setHasVoted(true);
      
      // Mark this poll as voted in localStorage
      const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
      votedPolls[sessionCode] = true;
      localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
    } catch (err) {
      setError(err.message);
    }
  };

  const chartData = poll ? {
    labels: poll.options,
    datasets: [
      {
        label: 'Votes',
        data: poll.votes,
        backgroundColor: [
          'linear-gradient(180deg, rgba(0, 206, 120, 0.8) 0%, rgba(0, 206, 120, 0.6) 100%)',
          'linear-gradient(180deg, rgba(34, 79, 60, 0.8) 0%, rgba(34, 79, 60, 0.6) 100%)',
          'linear-gradient(180deg, rgba(0, 206, 120, 0.7) 0%, rgba(0, 206, 120, 0.5) 100%)',
          'linear-gradient(180deg, rgba(34, 79, 60, 0.7) 0%, rgba(34, 79, 60, 0.5) 100%)',
          'linear-gradient(180deg, rgba(0, 206, 120, 0.6) 0%, rgba(0, 206, 120, 0.4) 100%)',
          'linear-gradient(180deg, rgba(34, 79, 60, 0.6) 0%, rgba(34, 79, 60, 0.4) 100%)',
        ],
        borderColor: [
          'rgba(0, 206, 120, 1)',
          'rgba(34, 79, 60, 1)',
          'rgba(0, 206, 120, 0.8)',
          'rgba(34, 79, 60, 0.8)',
          'rgba(0, 206, 120, 0.6)',
          'rgba(34, 79, 60, 0.6)',
        ],
        borderWidth: 2,
        borderRadius: {
          topLeft: 8,
          topRight: 8,
          bottomLeft: 0,
          bottomRight: 0
        },
        barThickness: 45,
        maxBarThickness: 50,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
      onProgress: function(animation) {
        const chart = animation.chart;
        const ctx = chart.ctx;
        const dataset = chart.data.datasets[0];
        const meta = chart.getDatasetMeta(0);

        meta.data.forEach((bar, index) => {
          const value = dataset.data[index];
          const total = dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.font = 'bold 12px Inter';
          ctx.fillStyle = '#224f3c';
          ctx.fillText(`${percentage}%`, bar.x, bar.y - 5);
          ctx.restore();
        });
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Poll Results',
        font: {
          size: 20,
          weight: 'bold',
          family: "'Inter', sans-serif"
        },
        padding: {
          top: 20,
          bottom: 30
        },
        color: '#224f3c'
      },
      tooltip: {
        backgroundColor: 'rgba(34, 79, 60, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(0, 206, 120, 0.3)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.raw} votes (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(34, 79, 60, 0.1)',
          drawBorder: false,
          lineWidth: 1
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          color: '#224f3c',
          padding: 10
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          color: '#224f3c',
          padding: 10
        }
      }
    },
    layout: {
      padding: {
        top: 30,
        right: 20,
        bottom: 20,
        left: 20
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#224f3c] flex items-center justify-center">
        <div className="text-xl text-white font-medium">Loading poll...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#224f3c] flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-red-600 mb-6 text-center font-medium">{error}</div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#00ce78] text-white py-4 px-6 rounded-lg hover:bg-[#00ce78]/90 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#00ce78] focus:ring-offset-2 text-lg font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-[#224f3c] flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-[#224f3c] mb-6 text-center font-medium">Poll not found</div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#00ce78] text-white py-4 px-6 rounded-lg hover:bg-[#00ce78]/90 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#00ce78] focus:ring-offset-2 text-lg font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (showNameInput) {
    return (
      <div className="min-h-screen bg-[#224f3c] flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#224f3c] mb-6 text-center">Join Poll</h2>
          <form onSubmit={handleJoin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center font-medium">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#224f3c] mb-3">
                Your Name
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-4 rounded-lg border-[#224f3c]/20 shadow-sm focus:border-[#00ce78] focus:ring-2 focus:ring-[#00ce78]/20 transition-colors duration-200 bg-white/50 text-lg"
                placeholder="Enter your name"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#00ce78] text-white py-4 px-6 rounded-lg hover:bg-[#00ce78]/90 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#00ce78] focus:ring-offset-2 text-lg font-medium"
            >
              Join Poll
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#224f3c] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h2 className="text-2xl font-bold text-[#224f3c] mb-4 sm:mb-0">{poll.question}</h2>
            <div className="bg-[#00ce78]/10 text-[#224f3c] px-4 py-2 rounded-lg text-sm font-medium">
              Session Code: <span className="font-bold">{sessionCode}</span>
            </div>
          </div>

          {!hasVoted ? (
            <div className="space-y-4 mb-8">
              {poll.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleVote(index)}
                  className="w-full text-left p-5 bg-white border-2 border-[#224f3c]/20 rounded-lg hover:bg-[#00ce78]/5 hover:border-[#00ce78] transition-all duration-200 font-medium text-[#224f3c] text-lg group"
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    <svg className="w-6 h-6 text-[#224f3c]/40 group-hover:text-[#00ce78] transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="mb-8">
              <div className="bg-[#00ce78]/10 text-[#224f3c] p-4 rounded-lg text-center font-medium mb-6">
                Thank you for voting!
              </div>
              <div className="h-[500px] bg-white p-6 rounded-lg border border-[#224f3c]/10">
                {chartData && <Bar data={chartData} options={chartOptions} />}
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#224f3c]/10 text-[#224f3c] py-4 px-6 rounded-lg hover:bg-[#224f3c]/20 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#224f3c] focus:ring-offset-2 text-lg font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserPanel; 