use std::time::{Duration, Instant, SystemTime};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HeartbeatCheck {
    Healthy,
    Missed(u8),
    Unhealthy,
}

#[derive(Debug, Clone)]
pub struct HeartbeatMonitor {
    interval: Duration,
    max_misses: u8,
    consecutive_misses: u8,
    last_heartbeat_at: Option<SystemTime>,
    last_signal_at: Option<Instant>,
}

impl HeartbeatMonitor {
    pub fn new(interval: Duration, max_misses: u8) -> Self {
        Self {
            interval,
            max_misses,
            consecutive_misses: 0,
            last_heartbeat_at: None,
            last_signal_at: None,
        }
    }

    pub fn interval(&self) -> Duration {
        self.interval
    }

    pub fn reset(&mut self) {
        self.consecutive_misses = 0;
        self.last_heartbeat_at = None;
        self.last_signal_at = Some(Instant::now());
    }

    pub fn mark_heartbeat(&mut self) {
        self.consecutive_misses = 0;
        self.last_heartbeat_at = Some(SystemTime::now());
        self.last_signal_at = Some(Instant::now());
    }

    pub fn last_heartbeat(&self) -> Option<SystemTime> {
        self.last_heartbeat_at
    }

    pub fn check(&mut self) -> HeartbeatCheck {
        let now = Instant::now();
        if let Some(last_signal) = self.last_signal_at {
            if now.duration_since(last_signal) < self.interval {
                return HeartbeatCheck::Healthy;
            }
        }

        self.consecutive_misses = self.consecutive_misses.saturating_add(1);
        self.last_signal_at = Some(now);

        if self.consecutive_misses >= self.max_misses {
            HeartbeatCheck::Unhealthy
        } else {
            HeartbeatCheck::Missed(self.consecutive_misses)
        }
    }
}
