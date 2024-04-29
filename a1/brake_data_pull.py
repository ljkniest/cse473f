# The purpose of this file is the pull brake data for the tracks
# based off of the fastest runs in 2023.
# We will pull the brake data from the fastest lap,
# aggregate it into quarter-second increments, and smooth the output.
# WEDIT: We don't need to smooth and the output time is in tenths of seconds.

# The three tracks will be: Monza, Monaco, and Spa.
# Inspired by and modified to take brake data and reformat:
# https://docs.fastf1.dev/examples_gallery/plot_annotate_speed_trace.html#sphx-glr-examples-gallery-plot-annotate-speed-trace-py

import fastf1.plotting
import numpy as np
import pandas as pd

year = 2023
race_type = 'Race'

# Monza
monza_session = fastf1.get_session(year, 'Monza', race_type)
monza_session.load()
monza_fastest_lap = monza_session.laps.pick_fastest()
# pandas series returned below
monza_telem = monza_fastest_lap.get_telemetry(frequency=10)
monza_brake_data = monza_telem['Brake']
monza_throttle_data = monza_telem['Throttle']

# Monaco
monaco_session = fastf1.get_session(year, 'Monaco', race_type)
monaco_session.load()
monaco_fastest_lap = monaco_session.laps.pick_fastest()
# pandas series returned below
monaco_brake_data = monaco_fastest_lap.telemetry['Brake']
monaco_throttle_data = monaco_fastest_lap.telemetry['Throttle']

# Spa
spa_session = fastf1.get_session(year, 'Spa', race_type)
spa_session.load()
spa_fastest_lap = spa_session.laps.pick_fastest()
# pandas series returned below
spa_brake_data = spa_fastest_lap.telemetry['Brake']
spa_throttle_data = spa_fastest_lap.telemetry['Throttle']

# Output arrays for use in embedded system
print("lap time: ")
print(monza_fastest_lap['LapTime'])
print(len(monza_brake_data))
# format all as c array
monza_brake_arr = f"bool monza_brake_data[] = {{" + ", ".join(str(int(val)) for val in monza_brake_data) + "};"
print(monza_brake_arr)

monaco_brake_arr = f"bool monaco_brake_data[] = {{" + ", ".join(str(int(val)) for val in monaco_brake_data) + "};"
print(monaco_brake_arr)

spa_brake_arr = f"bool spa_brake_data[] = {{" + ", ".join(str(int(val)) for val in spa_brake_data) + "};"
print(spa_brake_arr)
