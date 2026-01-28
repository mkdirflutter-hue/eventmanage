import React, { useState, useEffect } from 'react';
import '../../components/common/header.css';
import '../../components/common/sidebar.css';
import './dashboard.css';

import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import SmallChart from '../../components/common/SmallChart';

export default function Dashboard() {
	const [collapsed, setCollapsed] = useState(false);
	const [stats, setStats] = useState([]);

	useEffect(()=>{
		// mock fetch - replace with api calls
		setStats([
			{ title: 'Clubs', value: 24, delta: '+3' },
			{ title: 'Pending Signups', value: 7, delta: '-1', color: '#ef4444' },
			{ title: 'Event Requests', value: 12, delta: '+2', color: '#f59e0b' },
			{ title: 'Budget Left', value: '$8,400', delta: '-$600', color: '#10b981' },
		])
	},[])

	const recentEvents = [
		{ id:1, name:'Inter-College Fest', club:'Drama Society', date:'Feb 14', status:'Pending' },
		{ id:2, name:'Guest Lecture', club:'Tech Club', date:'Mar 02', status:'Approved' },
		{ id:3, name:'Blood Donation', club:'Health Club', date:'Mar 22', status:'Changes Requested' },
	];

	return (
		<div className="uc-admin-wrap">
			<Header onToggleSidebar={()=>setCollapsed(s=>!s)} />
			<div className="uc-main">
				<Sidebar collapsed={collapsed} />
				<main className="uc-content">
					<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
						<h2 style={{margin:0}}>Admin Dashboard</h2>
						<div style={{display:'flex',gap:8}}>
							<button style={{padding:'8px 12px',borderRadius:8,border:0,background:'#2563eb',color:'#fff'}}>New Club</button>
							<button style={{padding:'8px 12px',borderRadius:8,border:0,background:'#0b1220',color:'#fff',border:'1px solid #2b3440'}}>Approve Signups</button>
						</div>
					</div>

					<section className="uc-grid">
						<div className="uc-stats">
							{stats.map((s,i)=>(
								<StatCard key={i} title={s.title} value={s.value} delta={s.delta} color={s.color} />
							))}
						</div>

						<div className="uc-panel" style={{gridColumn:'span 8',marginTop:12}}>
							<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
								<strong>Activity Overview</strong>
								<div style={{display:'flex',gap:8}}>
									<button className="btn-ghost">7d</button>
									<button className="btn-ghost">30d</button>
								</div>
							</div>
							<div style={{height:160}}>
								<SmallChart data={[5,8,6,10,9,12,8,14]} />
							</div>
						</div>

						<div className="uc-panel" style={{gridColumn:'span 4',marginTop:12}}>
							<strong style={{display:'block',marginBottom:8}}>Recent Events</strong>
							<div className="uc-recent">
								{recentEvents.map(ev=> (
									<div key={ev.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:8,borderRadius:8,background:'rgba(255,255,255,0.02)'}}>
										<div>
											<div style={{fontWeight:700}}>{ev.name}</div>
											<div style={{fontSize:13,color:'#9ca3af'}}>{ev.club} • {ev.date}</div>
										</div>
										<div style={{fontSize:13,color: ev.status==='Approved'? '#10b981': ev.status==='Pending'? '#f59e0b':'#ef4444'}}>{ev.status}</div>
									</div>
								))}
							</div>
						</div>

						<div className="uc-panel" style={{gridColumn:'span 12',marginTop:12}}>
							<strong style={{display:'block',marginBottom:8}}>Pending Approvals</strong>
							<table className="uc-table">
								<thead>
									<tr><th>Request</th><th>Club</th><th>Date</th><th>Requested By</th><th></th></tr>
								</thead>
								<tbody>
									<tr>
										<td>Inter-College Fest</td>
										<td>Drama Society</td>
										<td>Feb 14</td>
										<td>Priya R.</td>
										<td style={{textAlign:'right'}}>
											<button style={{marginRight:8}}>Suggest Changes</button>
											<button style={{background:'#10b981',color:'#fff',border:0,padding:'6px 10px',borderRadius:6}}>Approve</button>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</section>

				</main>
			</div>
		</div>
	);
}

