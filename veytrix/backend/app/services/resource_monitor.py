"""System Resource & Health Monitor for production rendering queue protection."""

import os
import shutil
import psutil
from typing import Dict, Any, Tuple
from app.core.logging import logger


class ResourceMonitor:
    """Monitors system CPU, RAM, disk usage, and active renders to safeguard worker stability."""

    def __init__(
        self,
        max_cpu_percent: float = 95.0,
        max_memory_percent: float = 95.0,
        min_disk_free_gb: float = 1.0,
    ):
        self.max_cpu_percent = max_cpu_percent
        self.max_memory_percent = max_memory_percent
        self.min_disk_free_gb = min_disk_free_gb

    def get_system_metrics(self) -> Dict[str, Any]:
        """Returns current CPU, Memory, and Disk usage metrics."""
        cpu_usage = psutil.cpu_percent(interval=None)
        mem = psutil.virtual_memory()
        disk = shutil.disk_usage(os.getcwd())

        disk_free_gb = disk.free / (1024 ** 3)
        disk_total_gb = disk.total / (1024 ** 3)

        return {
            "cpu_percent": cpu_usage,
            "memory_percent": mem.percent,
            "memory_used_mb": mem.used / (1024 * 1024),
            "memory_total_mb": mem.total / (1024 * 1024),
            "disk_free_gb": round(disk_free_gb, 2),
            "disk_total_gb": round(disk_total_gb, 2),
        }

    def is_safe_for_new_render(self) -> Tuple[bool, str]:
        """Validates if system resources are safe to launch a new export task."""
        metrics = self.get_system_metrics()

        if metrics["cpu_percent"] > self.max_cpu_percent:
            msg = f"System CPU usage too high ({metrics['cpu_percent']}% > {self.max_cpu_percent}%)."
            logger.warning(f"Resource check failed: {msg}")
            return False, msg

        if metrics["memory_percent"] > self.max_memory_percent:
            msg = f"System RAM usage too high ({metrics['memory_percent']}% > {self.max_memory_percent}%)."
            logger.warning(f"Resource check failed: {msg}")
            return False, msg

        if metrics["disk_free_gb"] < self.min_disk_free_gb:
            msg = f"Insufficient disk space ({metrics['disk_free_gb']} GB free < {self.min_disk_free_gb} GB required)."
            logger.warning(f"Resource check failed: {msg}")
            return False, msg

        return True, "Resources optimal"


resource_monitor = ResourceMonitor()
