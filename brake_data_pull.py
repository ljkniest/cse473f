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
# confirm that time data is in millis along with the brake data
# time_data = monza_fastest_lap.telemetry['Time']
# print(len(time_data))
# verify that data is not junk
# print (len(brake_data))
# for value in brake_data:
#   if value == True:
#     print(value)
# print(len(throttle_data))
# for value in throttle_data:
#   if value < 99:
#     print(value)

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


# # reshape array from ms to qtr seconds
# num_intervals = len(monza_brake_data) // 10
# # Reshape the original Series into a 2D array with shape (num_intervals, 250)
# monza_brake_reshape = monza_brake_data[:num_intervals*10].values.reshape(num_intervals, 10)

# # Apply any function along the second axis (axis=1) to collapse each 250-millisecond interval
# monza_brake_qtr = pd.Series(monza_brake_reshape.any(axis=1))
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